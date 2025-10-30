import React, { useState, useRef, useEffect } from 'react';
import { X, Check, FileText, Download } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

export default function ContractApproval({ contract, onClose, onSuccess }) {
    const [approving, setApproving] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);

    useEffect(() => {
        initCanvas();
    }, []);

    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context.strokeStyle = '#1e293b';
            context.lineWidth = 2;
            context.lineCap = 'round';
            setCtx(context);
        }
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleApprove = async () => {
        const canvas = canvasRef.current;
        const signatureData = canvas.toDataURL();
        
        // Vérifier que le canvas n'est pas vide
        const blankCanvas = document.createElement('canvas');
        blankCanvas.width = canvas.width;
        blankCanvas.height = canvas.height;
        if (signatureData === blankCanvas.toDataURL()) {
            alert('Veuillez signer pour approuver le contrat');
            return;
        }
        
        setApproving(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/contract-templates/${contract.id}/approve/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    signature: signatureData
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert('Contrat approuvé avec succès !');
                onSuccess && onSuccess(data);
                onClose();
            } else {
                const error = await response.json();
                alert(error.error || 'Erreur lors de l\'approbation');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'approbation du contrat');
        } finally {
            setApproving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Approuver le Contrat</h2>
                                <p className="text-slate-300">Vérifiez et signez le contrat</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Contenu */}
                <div className="p-6 space-y-6">
                    {/* Informations du contrat */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4">Informations du Contrat</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-600">Locataire</p>
                                <p className="font-semibold text-slate-900">{contract.tenant_name}</p>
                            </div>
                            <div>
                                <p className="text-slate-600">Email</p>
                                <p className="font-semibold text-slate-900">{contract.tenant_email}</p>
                            </div>
                            <div>
                                <p className="text-slate-600">Propriété</p>
                                <p className="font-semibold text-slate-900">{contract.property_title}</p>
                            </div>
                            <div>
                                <p className="text-slate-600">Loyer Mensuel</p>
                                <p className="font-semibold text-slate-900">{contract.monthly_rent?.toLocaleString()} FCFA</p>
                            </div>
                        </div>
                    </div>

                    {/* Données remplies par le locataire */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h3 className="font-bold text-slate-900 mb-4">Informations du Locataire</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-600">Nom Complet</p>
                                <p className="font-semibold text-slate-900">{contract.contract_data?.fullName}</p>
                            </div>
                            <div>
                                <p className="text-slate-600">Téléphone</p>
                                <p className="font-semibold text-slate-900">{contract.contract_data?.phone}</p>
                            </div>
                            <div>
                                <p className="text-slate-600">Pièce d'Identité</p>
                                <p className="font-semibold text-slate-900">{contract.contract_data?.idNumber}</p>
                            </div>
                            <div>
                                <p className="text-slate-600">Profession</p>
                                <p className="font-semibold text-slate-900">{contract.contract_data?.profession}</p>
                            </div>
                            <div>
                                <p className="text-slate-600">Adresse</p>
                                <p className="font-semibold text-slate-900">{contract.contract_data?.address}</p>
                            </div>
                            <div>
                                <p className="text-slate-600">Contact d'Urgence</p>
                                <p className="font-semibold text-slate-900">{contract.contract_data?.emergencyContact} - {contract.contract_data?.emergencyPhone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Signature du locataire */}
                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h3 className="font-bold text-slate-900 mb-4">Signature du Locataire</h3>
                        <img 
                            src={contract.tenant_signature} 
                            alt="Signature du locataire"
                            className="border-2 border-green-300 rounded-lg bg-white p-4 max-w-md"
                        />
                        <p className="text-sm text-slate-600 mt-2">
                            Signé le {new Date(contract.signed_at).toLocaleDateString('fr-FR')} à {new Date(contract.signed_at).toLocaleTimeString('fr-FR')}
                        </p>
                    </div>

                    {/* Signature du propriétaire */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">Votre Signature *</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Signez dans le cadre ci-dessous pour approuver le contrat
                        </p>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
                            <canvas
                                ref={canvasRef}
                                width={700}
                                height={200}
                                className="border border-slate-300 rounded bg-white cursor-crosshair w-full"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="mt-3 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                            >
                                Effacer la signature
                            </button>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={approving}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {approving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Approbation en cours...
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    Approuver et Signer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}