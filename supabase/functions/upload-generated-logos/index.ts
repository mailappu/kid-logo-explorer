import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogoUpload {
  name: string;
  fileName: string;
  imageData: string; // base64 encoded
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { logos } = await req.json() as { logos: LogoUpload[] };
    
    const results = [];

    for (const logo of logos) {
      try {
        console.log(`Processing: ${logo.name}`);

        // Decode base64 image
        const imageBuffer = Uint8Array.from(atob(logo.imageData), c => c.charCodeAt(0));
        
        // Upload to storage
        const filePath = `${logo.fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('airline-logos')
          .upload(filePath, imageBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('airline-logos')
          .getPublicUrl(filePath);

        // Update database
        const { error: dbError } = await supabase
          .from('logo_items')
          .update({ logo_image_url: publicUrl })
          .eq('name', logo.name);

        if (dbError) {
          throw new Error(`Database update failed: ${dbError.message}`);
        }

        console.log(`Successfully processed: ${logo.name}`);
        results.push({ name: logo.name, status: 'success', url: publicUrl });

      } catch (error) {
        console.error(`Error processing ${logo.name}:`, error);
        results.push({ 
          name: logo.name, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'error').length;

    console.log(`Upload complete. Success: ${successCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({
        totalProcessed: results.length,
        successCount,
        failedCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
