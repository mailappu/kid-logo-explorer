-- Create logo_items table for storing airline logos and other categories
CREATE TABLE public.logo_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'airline',
  name TEXT NOT NULL,
  logo_image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.logo_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (no auth required for kids app)
CREATE POLICY "Anyone can view active logo items"
ON public.logo_items
FOR SELECT
USING (is_active = true);

-- Create policy for admin insert (for future admin panel)
CREATE POLICY "Admins can insert logo items"
ON public.logo_items
FOR INSERT
WITH CHECK (true);

-- Create policy for admin update
CREATE POLICY "Admins can update logo items"
ON public.logo_items
FOR UPDATE
USING (true);

-- Create policy for admin delete
CREATE POLICY "Admins can delete logo items"
ON public.logo_items
FOR DELETE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_logo_items_updated_at
BEFORE UPDATE ON public.logo_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster category queries
CREATE INDEX idx_logo_items_category ON public.logo_items(category);
CREATE INDEX idx_logo_items_active ON public.logo_items(is_active);

-- Insert sample airline data
INSERT INTO public.logo_items (category, name, logo_image_url, is_active) VALUES
('airline', 'Delta Airlines', 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Delta_logo.svg', true),
('airline', 'United Airlines', 'https://upload.wikimedia.org/wikipedia/commons/e/e0/United_Airlines_Logo.svg', true),
('airline', 'American Airlines', 'https://upload.wikimedia.org/wikipedia/commons/7/79/American_Airlines_logo_2013.svg', true),
('airline', 'Southwest Airlines', 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Southwest_Airlines_logo_2014.svg', true),
('airline', 'JetBlue Airways', 'https://upload.wikimedia.org/wikipedia/commons/f/f8/JetBlue_Airways_Logo.svg', true),
('airline', 'Alaska Airlines', 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Alaska_Airlines_Logo.svg', true),
('airline', 'Spirit Airlines', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Spirit_Airlines_logo.svg', true),
('airline', 'Frontier Airlines', 'https://upload.wikimedia.org/wikipedia/commons/2/21/Frontier_Airlines_logo.svg', true);