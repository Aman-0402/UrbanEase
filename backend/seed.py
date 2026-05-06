import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

from apps.services.models import Category, Service

categories = [
    ('Plumbing',        'wrench',       0),
    ('Electrician',     'zap',          1),
    ('Cleaning',        'sparkles',     2),
    ('AC & Appliances', 'wind',         3),
    ('Carpentry',       'hammer',       4),
    ('Painting',        'paintbrush',   5),
    ('Tutoring',        'book-open',    6),
    ('Salon & Spa',     'scissors',     7),
]

for name, icon, order in categories:
    cat, created = Category.objects.get_or_create(
        name=name, defaults={'icon': icon, 'order': order}
    )
    status = 'Created' if created else 'Exists'
    print(f'  {status}: [{icon}] {name}')

services_data = [
    ('Plumbing',        'Pipe Leak Repair',           349,  60),
    ('Plumbing',        'Tap Installation',            199,  45),
    ('Plumbing',        'Drain Cleaning',              299,  60),
    ('Electrician',     'Switchboard Repair',          249,  45),
    ('Electrician',     'Fan Installation',            199,  30),
    ('Electrician',     'Wiring and Earthing',         799, 180),
    ('Cleaning',        'Deep Home Cleaning',          999, 240),
    ('Cleaning',        'Sofa and Carpet Cleaning',    599, 120),
    ('Cleaning',        'Kitchen Deep Clean',          699, 150),
    ('AC & Appliances', 'AC Service and Gas Refill',   799,  90),
    ('AC & Appliances', 'Washing Machine Repair',      499,  60),
    ('Carpentry',       'Furniture Assembly',          399,  90),
    ('Carpentry',       'Door and Lock Repair',        299,  60),
    ('Painting',        'Wall Painting per room',     1499, 480),
    ('Tutoring',        'Maths Tuition per hour',      499,  60),
    ('Salon & Spa',     'Haircut at Home',             299,  45),
    ('Salon & Spa',     'Full Body Waxing',            599,  90),
]

for cat_name, svc_name, price, duration in services_data:
    cat = Category.objects.get(name=cat_name)
    svc, created = Service.objects.get_or_create(
        name=svc_name,
        defaults={
            'category': cat,
            'base_price': price,
            'duration_minutes': duration,
            'description': 'Professional ' + svc_name.lower() + ' service at your doorstep.',
        }
    )
    status = 'Created' if created else 'Exists'
    print('  ' + status + ': ' + svc_name + ' (Rs.' + str(price) + ')')

print('\nSeeding complete!')
