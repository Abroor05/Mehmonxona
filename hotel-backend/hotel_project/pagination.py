from rest_framework.pagination import PageNumberPagination


class FlexiblePageNumberPagination(PageNumberPagination):
    """
    Standart pagination, lekin client page_size ni o'zgartira oladi.
    Masalan: ?page_size=200 barcha xonalarni olish uchun.
    """
    page_size            = 20
    page_size_query_param = 'page_size'
    max_page_size        = 500
