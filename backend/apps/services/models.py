from django.db import models
from django.utils.text import slugify
from django.conf import settings


class Category(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(max_length=120, unique=True, blank=True)
    icon        = models.CharField(max_length=50, default='wrench')  # icon slug mapped on frontend
    description = models.TextField(blank=True)
    is_active   = models.BooleanField(default=True)
    order       = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Service(models.Model):
    category         = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='services')
    name             = models.CharField(max_length=200)
    slug             = models.SlugField(max_length=220, unique=True, blank=True)
    description      = models.TextField()
    base_price       = models.DecimalField(max_digits=8, decimal_places=2)
    duration_minutes = models.PositiveIntegerField(default=60, help_text='Estimated duration in minutes')
    image            = models.ImageField(upload_to='services/', blank=True, null=True)
    is_active        = models.BooleanField(default=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.category.name} — {self.name}'


class ProviderProfile(models.Model):
    user             = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='provider_profile')
    bio              = models.TextField(blank=True)
    experience_years = models.PositiveSmallIntegerField(default=0)
    services         = models.ManyToManyField(Service, related_name='providers', blank=True)
    hourly_rate      = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    city             = models.CharField(max_length=100, blank=True)
    latitude         = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude        = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_available     = models.BooleanField(default=True)
    is_verified      = models.BooleanField(default=False)
    avg_rating       = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews    = models.PositiveIntegerField(default=0)
    total_jobs       = models.PositiveIntegerField(default=0)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-avg_rating', '-total_jobs']

    def __str__(self):
        return f'{self.user.full_name or self.user.phone} — Provider'


class ProviderKYCDocument(models.Model):
    AADHAAR         = 'aadhaar'
    PAN             = 'pan'
    DRIVING_LICENSE = 'driving_license'
    PASSPORT        = 'passport'
    ID_TYPE_CHOICES = [
        (AADHAAR,         'Aadhaar Card'),
        (PAN,             'PAN Card'),
        (DRIVING_LICENSE, 'Driving License'),
        (PASSPORT,        'Passport'),
    ]

    NOT_SUBMITTED  = 'not_submitted'
    PENDING_REVIEW = 'pending_review'
    VERIFIED       = 'verified'
    REJECTED       = 'rejected'
    STATUS_CHOICES = [
        (NOT_SUBMITTED,  'Not Submitted'),
        (PENDING_REVIEW, 'Pending Review'),
        (VERIFIED,       'Verified'),
        (REJECTED,       'Rejected'),
    ]

    provider         = models.OneToOneField(ProviderProfile, on_delete=models.CASCADE, related_name='kyc')
    govt_id_type     = models.CharField(max_length=20, choices=ID_TYPE_CHOICES, blank=True)
    govt_id_number   = models.CharField(max_length=50, blank=True)
    id_front         = models.ImageField(upload_to='kyc/id/', blank=True, null=True)
    id_back          = models.ImageField(upload_to='kyc/id/', blank=True, null=True)
    selfie           = models.ImageField(upload_to='kyc/selfie/', blank=True, null=True)
    kyc_status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default=NOT_SUBMITTED)
    rejection_reason = models.TextField(blank=True)
    submitted_at     = models.DateTimeField(null=True, blank=True)
    reviewed_at      = models.DateTimeField(null=True, blank=True)
    reviewed_by      = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='kyc_reviews'
    )

    def __str__(self):
        return f'KYC — {self.provider} [{self.kyc_status}]'
