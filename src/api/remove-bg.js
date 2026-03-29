/**
 * Cloudflare Worker - Remove.bg API Proxy
 * 
 * Receives base64 image from frontend, forwards to Remove.bg,
 * returns the result. No data is stored.
 */

export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await context.request.json();
    const { image } = body;

    if (!image) {
      return new Response(JSON.stringify({ success: false, error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = context.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Remove.bg API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert base64 to binary (remove data URL prefix if present)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create FormData for Remove.bg API
    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'image/png' });
    formData.append('image_file', blob, 'image.png');
    formData.append('size', 'auto');

    // Forward to Remove.bg
    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      return new Response(JSON.stringify({ success: false, error: `Remove.bg API error: ${errorText}` }), {
        status: removeBgResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the result as blob
    const resultBlob = await removeBgResponse.blob();
    const resultBuffer = await resultBlob.arrayBuffer();

    // Convert to base64 for return
    const resultBase64 = btoa(
      String.fromCharCode(...new Uint8Array(resultBuffer))
    );

    return new Response(JSON.stringify({
      success: true,
      result: `data:image/png;base64,${resultBase64}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
