import React from 'react';
import { Card } from '../src/components/ui/Card';
import { Button } from '../src/components/ui/Button';
import { SectionHeader } from '../src/components/ui/SectionHeader';

interface RelatoriosTabProps {
    onOpenGerarRelatorio: () => void;
    onOpenGerarRelatorioDocumentos: () => void;
}

export const RelatoriosTab: React.FC<RelatoriosTabProps> = ({ onOpenGerarRelatorio, onOpenGerarRelatorioDocumentos }) => {
    return (
        <div className="space-y-4">
            <SectionHeader label="Relatorios" title="Central de Relatorios" />
            <Card className="space-y-4">
                <p className="text-sm text-slate-600">
                    Gere relatorios detalhados sobre o status dos exames de seus funcionarios ou a validade dos documentos das empresas.
                    Utilize os filtros avancados para extrair exatamente a informacao que precisa.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                    <Button onClick={onOpenGerarRelatorio} className="w-full sm:w-auto">Relatorio de Funcionarios</Button>
                    <Button variant="secondary" onClick={onOpenGerarRelatorioDocumentos} className="w-full sm:w-auto">Relatorio de Documentos</Button>
                </div>
            </Card>
        </div>
    );
};
