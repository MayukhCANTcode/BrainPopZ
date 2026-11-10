import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Extracts standard 11-character YouTube video ID from various URL formats.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - Raw video ID
 */
export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // If already a clean 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetches basic video title and author using public YouTube oEmbed API.
 */
export async function fetchYouTubeVideoDetails(videoId) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'BrainPopZ-Study-Engine/1.0' },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || 'YouTube Video Lecture',
        author: data.author_name || 'YouTube Creator',
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch (err) {
    console.warn(`[YOUTUBE] oEmbed details fetch failed for ${videoId}:`, err.message);
  }

  return {
    title: `YouTube Lecture (${videoId})`,
    author: 'YouTube',
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

/**
 * Fetches and formats YouTube transcript for educational AI processing.
 */
export async function getYouTubeTranscript(urlOrId) {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) {
    const error = new Error('Invalid YouTube URL or Video ID. Please check the link and try again.');
    error.status = 400;
    throw error;
  }

  // 1. Fetch metadata in parallel with transcript
  const detailsPromise = fetchYouTubeVideoDetails(videoId);

  // 2. Fetch transcript using youtube-transcript
  let transcriptItems = [];
  try {
    transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (err) {
    console.error(`[YOUTUBE] Transcript fetch failed for ${videoId}:`, err.message);
    const friendlyError = new Error(
      'Could not retrieve transcript. The video might be private, have captions disabled, or not contain English captions.'
    );
    friendlyError.status = 404;
    throw friendlyError;
  }

  if (!transcriptItems || transcriptItems.length === 0) {
    const emptyError = new Error('No transcript segments found for this video.');
    emptyError.status = 404;
    throw emptyError;
  }

  const details = await detailsPromise;

  // Clean and combine transcript items
  const cleanSegments = transcriptItems.map((item) => {
    const text = (item.text || '')
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return {
      text,
      offset: item.offset,
      duration: item.duration,
    };
  }).filter((item) => item.text.length > 0);

  // Combine into clean readable paragraphs
  const fullText = cleanSegments.map((s) => s.text).join(' ');
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return {
    videoId,
    title: details.title,
    author: details.author,
    thumbnail: details.thumbnail,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    transcript: fullText,
    wordCount,
    segmentsCount: cleanSegments.length,
    estimatedMinutes: Math.max(1, Math.round(wordCount / 140)), // ~140 wpm spoken English
  };
}

