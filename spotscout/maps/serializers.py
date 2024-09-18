from rest_framework import serializers
from .models import UserMap

class UserMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMap
        fields = ['id', 'name', 'data', 'created_at', 'updated_at']