ALTER TABLE public.packages ADD COLUMN original_price NUMERIC(12,2);
ALTER TABLE public.packages ADD COLUMN discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0;
UPDATE public.packages
SET original_price = NULLIF(regexp_replace(price_label, '[^0-9.]', '', 'g'), '')::numeric
WHERE price_label IS NOT NULL
  AND regexp_replace(price_label, '[^0-9.]', '', 'g') ~ '^[0-9]+(\.[0-9]+)?$';