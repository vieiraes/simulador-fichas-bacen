#!/bin/bash

# Script para iniciar todos os componentes do simulador de fichas BACEN

echo "🚀 Iniciando Simulador de Fichas BACEN..."
echo ""

# Compilar TypeScript
echo "📦 Compilando TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro ao compilar TypeScript"
    exit 1
fi

echo "✅ Compilação concluída"
echo ""

# Compilar Frontend
echo "🎨 Compilando Frontend..."
npm run build:frontend

if [ $? -ne 0 ]; then
    echo "❌ Erro ao compilar Frontend"
    exit 1
fi

echo "✅ Frontend compilado"
echo ""

# Iniciar Worker e Server com concurrently
echo "🔧 Iniciando Worker e Server..."
npm start
