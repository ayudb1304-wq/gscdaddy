-- Seed dummy GSC data for testing
-- Site: b7e1b84e-c324-46b9-9b50-3606ee38bdb6 (thecurately.com)

DO $$
DECLARE
  v_site_id UUID := 'b7e1b84e-c324-46b9-9b50-3606ee38bdb6';
  v_date DATE;
  v_query TEXT;
  v_page TEXT;
  v_base_position NUMERIC;
  v_base_impressions INT;
  v_position NUMERIC;
  v_impressions INT;
  v_clicks INT;
  v_ctr NUMERIC;
BEGIN

  -- Define keyword/page combos with base metrics
  -- Striking distance keywords (position 5-15)
  FOR v_date IN SELECT generate_series(CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '3 days', '1 day')::date LOOP

    -- Keyword 1: High opportunity
    v_position := 6.2 + (random() * 2 - 1);
    v_impressions := 180 + floor(random() * 60)::int;
    v_clicks := floor(v_impressions * (0.03 + random() * 0.02))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'best curated gift boxes', 'https://thecurately.com/gift-boxes', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 2
    v_position := 8.5 + (random() * 2 - 1);
    v_impressions := 320 + floor(random() * 80)::int;
    v_clicks := floor(v_impressions * (0.02 + random() * 0.015))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'curated subscription box reviews', 'https://thecurately.com/reviews', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 3
    v_position := 11.3 + (random() * 2 - 1);
    v_impressions := 450 + floor(random() * 100)::int;
    v_clicks := floor(v_impressions * (0.01 + random() * 0.01))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'monthly subscription boxes for women', 'https://thecurately.com/womens-boxes', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 4
    v_position := 7.8 + (random() * 1.5 - 0.75);
    v_impressions := 140 + floor(random() * 40)::int;
    v_clicks := floor(v_impressions * (0.025 + random() * 0.015))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'artisan food gift basket', 'https://thecurately.com/food-gifts', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 5
    v_position := 13.1 + (random() * 2 - 1);
    v_impressions := 600 + floor(random() * 150)::int;
    v_clicks := floor(v_impressions * (0.008 + random() * 0.007))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'luxury gift box delivery', 'https://thecurately.com/luxury', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 6
    v_position := 9.4 + (random() * 1.5 - 0.75);
    v_impressions := 210 + floor(random() * 50)::int;
    v_clicks := floor(v_impressions * (0.018 + random() * 0.012))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'personalized gift curation service', 'https://thecurately.com/personalized', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 7
    v_position := 5.3 + (random() * 1 - 0.5);
    v_impressions := 95 + floor(random() * 30)::int;
    v_clicks := floor(v_impressions * (0.04 + random() * 0.02))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'the curately reviews', 'https://thecurately.com/', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 8
    v_position := 14.2 + (random() * 1 - 0.5);
    v_impressions := 520 + floor(random() * 120)::int;
    v_clicks := floor(v_impressions * (0.006 + random() * 0.006))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'unique birthday gift ideas', 'https://thecurately.com/birthday-gifts', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 9: Non-striking (position 1-4, for dashboard variety)
    v_position := 2.1 + (random() * 1.5 - 0.75);
    v_impressions := 800 + floor(random() * 200)::int;
    v_clicks := floor(v_impressions * (0.12 + random() * 0.06))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'thecurately', 'https://thecurately.com/', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 10: Non-striking (position 1-4)
    v_position := 3.4 + (random() * 1 - 0.5);
    v_impressions := 400 + floor(random() * 100)::int;
    v_clicks := floor(v_impressions * (0.08 + random() * 0.04))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'curately gift box', 'https://thecurately.com/gift-boxes', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 11: Non-striking (position 20+, for total metrics)
    v_position := 22 + (random() * 5);
    v_impressions := 50 + floor(random() * 30)::int;
    v_clicks := floor(v_impressions * (0.005 + random() * 0.005))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'gift box subscription cheap', 'https://thecurately.com/pricing', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

    -- Keyword 12
    v_position := 10.1 + (random() * 2 - 1);
    v_impressions := 280 + floor(random() * 70)::int;
    v_clicks := floor(v_impressions * (0.015 + random() * 0.01))::int;
    v_ctr := CASE WHEN v_impressions > 0 THEN v_clicks::numeric / v_impressions ELSE 0 END;
    INSERT INTO gsc_data (site_id, date, query, page, clicks, impressions, ctr, position)
    VALUES (v_site_id, v_date, 'corporate gift boxes bulk', 'https://thecurately.com/corporate', v_clicks, v_impressions, v_ctr, v_position)
    ON CONFLICT (site_id, date, query, page, country, device) DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, ctr=EXCLUDED.ctr, position=EXCLUDED.position;

  END LOOP;

  -- Update the site's sync status
  UPDATE sites
  SET sync_status = 'completed',
      last_synced_at = NOW(),
      sync_progress = 'Seeded with dummy data'
  WHERE id = v_site_id;

END $$;

-- Refresh the materialized view so striking distance report works
REFRESH MATERIALIZED VIEW private.striking_distance_keywords;
