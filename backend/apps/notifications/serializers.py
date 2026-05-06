from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ('id', 'notif_type', 'title', 'body', 'is_read', 'booking', 'created_at')
        read_only_fields = ('id', 'notif_type', 'title', 'body', 'booking', 'created_at')
