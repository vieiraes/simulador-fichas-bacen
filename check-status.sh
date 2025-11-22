#!/bin/bash

echo "🔍 Verificando status do Simulador de Fichas BACEN..."
echo ""

# Verificar se compilado
if [ -d "dist" ] && [ -f "dist/server.js" ]; then
    echo "✅ Backend compilado (dist/)"
else
    echo "❌ Backend NÃO compilado - execute: npm run build"
fi

if [ -d "frontend-build" ] && [ -f "frontend-build/index.html" ]; then
    echo "✅ Frontend compilado (frontend-build/)"
else
    echo "❌ Frontend NÃO compilado - execute: npm run build:frontend"
fi

echo ""
echo "🌐 Verificando serviços..."

# Verificar porta 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Server rodando na porta 3000"
    
    # Testar API
    if curl -s http://localhost:3000/bff/dashboard >/dev/null 2>&1; then
        echo "✅ API respondendo corretamente"
    else
        echo "⚠️  Server na porta 3000 mas API não responde"
    fi
else
    echo "❌ Server NÃO está rodando na porta 3000"
    echo "   Execute: npm start"
fi

echo ""
echo "📊 Endpoints disponíveis:"
echo "   🏠 Frontend:  http://localhost:3000/"
echo "   🔌 API:       http://localhost:3000/api"
echo "   🎯 BFF:       http://localhost:3000/bff"
echo ""
