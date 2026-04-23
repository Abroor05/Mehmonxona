"""Custom User model with role-based access control."""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN        = 'admin',        'Administrator'
        MANAGER      = 'manager',      'Manager'
        RECEPTIONIST = 'receptionist', 'Receptionist'
        HOUSEKEEPER  = 'housekeeper',  'Housekeeper'
        ACCOUNTANT   = 'accountant',   'Accountant'
        CUSTOMER     = 'customer',     'Customer'

    username   = models.CharField(max_length=50, unique=True)
    email      = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name  = models.CharField(max_length=50)
    phone      = models.CharField(max_length=20, blank=True)
    role       = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD  = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_full_name()} ({self.role})'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_manager(self):
        return self.role in (self.Role.ADMIN, self.Role.MANAGER)
