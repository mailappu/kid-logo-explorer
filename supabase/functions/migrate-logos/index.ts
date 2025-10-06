import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting logo migration...')

    // Fetch all logo items
    const { data: logos, error: fetchError } = await supabase
      .from('logo_items')
      .select('*')
      .eq('category', 'airline')

    if (fetchError) {
      console.error('Error fetching logos:', fetchError)
      throw fetchError
    }

    console.log(`Found ${logos?.length || 0} logos to migrate`)

    const results = []

    for (const logo of logos || []) {
      try {
        console.log(`Processing: ${logo.name}`)
        
        // Download image from Wikipedia
        const imageResponse = await fetch(logo.logo_image_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LogoMigration/1.0)',
          },
        })

        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`)
        }

        const imageBlob = await imageResponse.blob()
        const imageBuffer = await imageBlob.arrayBuffer()
        
        // Generate filename from logo name
        const filename = `${logo.name.toLowerCase().replace(/\s+/g, '-')}.${
          imageBlob.type.split('/')[1] || 'png'
        }`
        
        console.log(`Uploading ${filename}...`)

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('airline-logos')
          .upload(filename, imageBuffer, {
            contentType: imageBlob.type,
            upsert: true,
          })

        if (uploadError) {
          console.error(`Upload error for ${logo.name}:`, uploadError)
          throw uploadError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('airline-logos')
          .getPublicUrl(filename)

        console.log(`Uploaded successfully: ${publicUrl}`)

        // Update database with new URL
        const { error: updateError } = await supabase
          .from('logo_items')
          .update({ logo_image_url: publicUrl })
          .eq('id', logo.id)

        if (updateError) {
          console.error(`Update error for ${logo.name}:`, updateError)
          throw updateError
        }

        results.push({
          name: logo.name,
          oldUrl: logo.logo_image_url,
          newUrl: publicUrl,
          status: 'success',
        })

        console.log(`✓ Completed: ${logo.name}`)
      } catch (error) {
        console.error(`Error processing ${logo.name}:`, error)
        results.push({
          name: logo.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'failed',
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status === 'failed').length

    console.log(`Migration complete. Success: ${successCount}, Failed: ${failedCount}`)

    return new Response(
      JSON.stringify({
        message: 'Logo migration completed',
        totalProcessed: results.length,
        successCount,
        failedCount,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Migration error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
