from rest_framework import serializers
from .models import Room, RoomImage, RoomStatusLog


class RoomImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model  = RoomImage
        fields = ['id', 'image', 'image_url', 'caption', 'is_primary', 'order', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None


class RoomSerializer(serializers.ModelSerializer):
    is_available   = serializers.ReadOnlyField()
    images         = RoomImageSerializer(many=True, read_only=True)
    amenities_list = serializers.SerializerMethodField()
    primary_image  = serializers.SerializerMethodField()

    class Meta:
        model  = Room
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_amenities_list(self, obj):
        return obj.get_amenities_list()

    def get_primary_image(self, obj):
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first()
        if not primary:
            primary = obj.images.first()
        if primary and primary.image:
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None


class RoomStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Room.Status.choices)
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)


class RoomStatusLogSerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = RoomStatusLog
        fields = '__all__'

    def get_changed_by_name(self, obj):
        return obj.changed_by.get_full_name() if obj.changed_by else None
