# Generated by Django 5.0.6 on 2024-09-27 08:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0008_locationcategory'),
    ]

    operations = [
        migrations.AlterField(
            model_name='locationcategory',
            name='id',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
    ]
