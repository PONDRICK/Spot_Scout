from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import UserMap
from .serializers import UserMapSerializer

class SaveUserMapView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        name = request.data.get('name')
        data = request.data.get('data')

        if not name or not data:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        user_map, created = UserMap.objects.update_or_create(
            user=user, name=name,
            defaults={'data': data}
        )

        return Response(UserMapSerializer(user_map).data, status=status.HTTP_201_CREATED)


class GetUserMapsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_maps = UserMap.objects.filter(user=user)
        serializer = UserMapSerializer(user_maps, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class DeleteUserMapView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, map_id):
        user = request.user
        try:
            user_map = UserMap.objects.get(id=map_id, user=user)
            user_map.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserMap.DoesNotExist:
            return Response({"error": "Map not found"}, status=status.HTTP_404_NOT_FOUND)