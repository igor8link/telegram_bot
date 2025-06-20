# Generated by Django 4.2.21 on 2025-06-02 16:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='cart',
            options={'verbose_name_plural': 'Корзина'},
        ),
        migrations.AlterModelOptions(
            name='cartitem',
            options={'verbose_name_plural': 'Товары в корзинах'},
        ),
        migrations.AlterModelOptions(
            name='category',
            options={'verbose_name_plural': 'Категории'},
        ),
        migrations.AlterModelOptions(
            name='color',
            options={'verbose_name_plural': 'Цвета'},
        ),
        migrations.AlterModelOptions(
            name='favorite',
            options={'verbose_name_plural': 'Любимые товары'},
        ),
        migrations.AlterModelOptions(
            name='order',
            options={'verbose_name_plural': 'Заказы'},
        ),
        migrations.AlterModelOptions(
            name='product',
            options={'ordering': ['-created_at'], 'verbose_name_plural': 'Товары'},
        ),
        migrations.AlterModelOptions(
            name='productimage',
            options={'ordering': ['sort_order'], 'verbose_name_plural': 'Изображения товаров'},
        ),
        migrations.AlterModelOptions(
            name='productstock',
            options={'verbose_name_plural': 'Наличие товаров'},
        ),
        migrations.AlterModelOptions(
            name='productvariant',
            options={'verbose_name_plural': 'Разные варианты цветов одних и тех же товаров'},
        ),
        migrations.AlterModelOptions(
            name='size',
            options={'ordering': ['display_order'], 'verbose_name_plural': 'Размеры'},
        ),
        migrations.AlterField(
            model_name='color',
            name='code',
            field=models.CharField(help_text='Цвет', max_length=20),
        ),
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('pending', 'Создано'), ('processing', 'В процессе'), ('shipped', 'Отправленно'), ('delivered', 'Доставлено'), ('cancelled', 'Отменено')], default='pending', max_length=20),
        ),
        migrations.AlterField(
            model_name='product',
            name='article',
            field=models.CharField(help_text='Уникальный артикул товара', max_length=50, unique=True),
        ),
        migrations.AlterField(
            model_name='product',
            name='composition',
            field=models.CharField(blank=True, help_text='Состав: Хлопок 95%, Полиестр 5%', max_length=255),
        ),
        migrations.AlterField(
            model_name='productvariant',
            name='is_default',
            field=models.BooleanField(default=False, help_text='Это основной вариант товара?'),
        ),
    ]
