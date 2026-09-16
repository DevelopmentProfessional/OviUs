-- Predetermined system-wide indicators with calculation weights.
-- High weight = strong explicit signal, Low weight = subtle/secondary signal.

INSERT INTO indicators_master (metric_name, phase_association, mathematical_weight) VALUES
    ('Overcoat',              'period',    9.0),
    ('Heating Pad Use',       'period',    8.0),
    ('Chocolate Craving',     'period',    5.0),
    ('Irritability',          'period',    4.0),
    ('Bloating',              'period',    6.0),
    ('Comfort Food Order',    'period',    3.0),
    ('Sweatpants',            'period',    5.0),
    ('Acne Flare-Up',         'period',    3.5),

    ('Mini Skirt',            'ovulation', 9.0),
    ('Increased Flirtatiousness', 'ovulation', 7.5),
    ('Heightened Libido',     'ovulation', 8.5),
    ('Extra Makeup Effort',   'ovulation', 5.0),
    ('New Outfit Purchase',   'ovulation', 4.5),
    ('Increased Sociability', 'ovulation', 4.0),
    ('Perfume Use',           'ovulation', 3.0),
    ('High Energy Level',     'ovulation', 3.5)
ON CONFLICT (metric_name) DO NOTHING;
