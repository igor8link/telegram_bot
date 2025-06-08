from rest_framework import serializers
from django.contrib.auth.models import User
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from .models import CustomerProfile


class CustomUserCreateSerializer(BaseUserCreateSerializer):
    """Валидатор модели пользователя Django с прокси моделью"""
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True, write_only=True)
    address = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'password', 'phone_number', 'address')
    
    def validate(self, attrs):
        # Исключение информации прокси модели из валидатора модели пользователя
        self.profile_data = {
            'phone_number': attrs.pop('phone_number', ''),
            'address': attrs.pop('address', '')
        }
        return super().validate(attrs)
    
    def create(self, validated_data):
        # Создание пользователя модели Django
        user = super().create(validated_data)
        
        # Создание профиля с моделью пользователя Django и прокси моделью
        CustomerProfile.objects.create(
            user=user,
            phone_number=self.profile_data.get('phone_number', ''),
            address=self.profile_data.get('address', '')
        )
        
        return user


class CustomUserSerializer(serializers.ModelSerializer):
    """Прокси модель для профиля"""
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'profile')
        read_only_fields = ('id',)
    
    def get_profile(self, obj):
        try:
            profile = obj.profile
            return {
                'phone_number': profile.phone_number,
                'address': profile.address
            }
        except CustomerProfile.DoesNotExist:
            return {
                'phone_number': '',
                'address': ''
            }