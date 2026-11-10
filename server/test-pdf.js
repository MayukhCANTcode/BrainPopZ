// Minimal PDF extraction test script

async function testPdfRoute() {
  console.log('Testing /api/extract-pdf endpoint...');

  // 1. Authenticate to get valid signed session cookie
  const authRes = await fetch('http://localhost:3001/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential: 'dev-eval-token:alex.rivera@university.edu' }),
  });
  const sessionCookie = authRes.headers.get('set-cookie');

  // 2. Create minimal synthetic 1-page PDF
  const minimalPdf = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 300 300]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj 4 0 obj<</Length 55>>stream\nBT /F1 12 Tf 50 250 Td (Photosynthesis and Calvin Cycle Notes) Tj ET\nendstream\nendobj 5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n0000000212 00000 n\n0000000318 00000 n\ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n386\n%%EOF'
  );

  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="lecture_notes.pdf"\r\nContent-Type: application/pdf\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([Buffer.from(header), minimalPdf, Buffer.from(footer)]);

  const res = await fetch('http://localhost:3001/api/extract-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: sessionCookie,
    },
    body,
  });

  const json = await res.json();
  console.log('Response Status:', res.status);
  console.log('Response JSON:', json);
  if (json.success && json.data.text.includes('Photosynthesis')) {
    console.log('✅ PDF Extraction test PASSED!');
  } else {
    console.log('❌ PDF Extraction failed:', json);
  }
}

testPdfRoute().catch(console.error);
