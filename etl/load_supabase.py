#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Carga para o Supabase (PostgreSQL / PostgREST API)
Observatório de Vulnerabilidade Socioenergética de Salvador — SENAI CIMATEC

Como usar:
1. Execute o schema SQL (`supabase/schema.sql`) no SQL Editor do seu projeto Supabase.
2. Opção A (Via SQL Editor): Execute `supabase/seed.sql` diretamente no painel do Supabase.
3. Opção B (Via API Python): Configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no arquivo `.env`
   (nunca no frontend!) e execute:
       python etl/load_supabase.py
"""

import json
import os
import sys
import requests

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROC_DIR = os.path.join(BASE_DIR, "data", "processed")


def load_env_file():
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                s = line.strip()
                if s and not s.startswith("#") and "=" in s:
                    k, v = s.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())


def upsert_table(supabase_url, api_key, table_name, rows):
    url = f"{supabase_url.rstrip('/')}/rest/v1/{table_name}"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    resp = requests.post(url, headers=headers, json=rows, timeout=30)
    if resp.status_code not in (200, 201, 204):
        raise RuntimeError(f"Erro ao popular tabela '{table_name}' (HTTP {resp.status_code}): {resp.text}")
    print(f"[Supabase-Load] Tabela '{table_name}': {len(rows)} registros sincronizados com sucesso.")


def main():
    load_env_file()
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    api_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

    if not supabase_url or not api_key or "seu-projeto-id" in supabase_url:
        print(
            "[Aviso] Variáveis SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configuradas em .env.\n"
            "O arquivo SQL completo já foi gerado em `supabase/seed.sql` e pode ser executado diretamente\n"
            "no SQL Editor do Supabase, ou configure o `.env` e rode `python etl/load_supabase.py` novamente."
        )
        sys.exit(0)

    tables = ["territories", "fontes", "indicadores", "observacoes", "analyses"]
    for t in tables:
        json_path = os.path.join(PROC_DIR, f"{t}.json")
        with open(json_path, "r", encoding="utf-8") as f:
            rows = json.load(f)
        upsert_table(supabase_url, api_key, t, rows)

    print("[Supabase-Load] Carga completa finalizada!")


if __name__ == "__main__":
    main()
