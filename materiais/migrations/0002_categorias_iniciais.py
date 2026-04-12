from django.db import migrations


CATEGORIAS = [
    'Areia',
    'Brita',
    'Cimento',
    'Elétrica',
    'Ferragem / Aço',
    'Ferramentas',
    'Hidráulica',
    'Madeira',
    'Pintura',
    'Telha / Cobertura',
    'Outros',
]


def criar_categorias(apps, schema_editor):
    CategoriaMaterial = apps.get_model('materiais', 'CategoriaMaterial')
    for nome in CATEGORIAS:
        CategoriaMaterial.objects.get_or_create(nome=nome)


def remover_categorias(apps, schema_editor):
    CategoriaMaterial = apps.get_model('materiais', 'CategoriaMaterial')
    CategoriaMaterial.objects.filter(nome__in=CATEGORIAS).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('materiais', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(criar_categorias, remover_categorias),
    ]
