"""Fixtures compartilhadas: carregam os artefatos gerados pelo ETL em data/processed/."""
import json
import os
import sys

import pytest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROC_DIR = os.path.join(BASE_DIR, "data", "processed")

# Permite `import run_etl` nos testes de funções do pipeline
sys.path.insert(0, os.path.join(BASE_DIR, "etl"))


def _load(name):
    with open(os.path.join(PROC_DIR, f"{name}.json"), encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="session")
def base_dir():
    return BASE_DIR


@pytest.fixture(scope="session")
def territories():
    return _load("territories")


@pytest.fixture(scope="session")
def fontes():
    return _load("fontes")


@pytest.fixture(scope="session")
def indicadores():
    return _load("indicadores")


@pytest.fixture(scope="session")
def observacoes():
    return _load("observacoes")


@pytest.fixture(scope="session")
def analyses():
    return _load("analyses")


@pytest.fixture(scope="session")
def bundle():
    return _load("observatorio_bundle")


@pytest.fixture(scope="session")
def geojson_setores():
    return _load("geojson_setores")


@pytest.fixture(scope="session")
def terr_by_id(territories):
    return {t["id"]: t for t in territories}


@pytest.fixture(scope="session")
def ind_by_id(indicadores):
    return {i["id"]: i for i in indicadores}


@pytest.fixture(scope="session")
def fonte_by_id(fontes):
    return {f["id"]: f for f in fontes}
