import React, { useState, useRef, useEffect } from 'react';
import { X, Check, FileText, Download, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

export default function ContractApproval() {
    const { contractId } = useParams();
    const navigate = useNavigate();
    
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);

    useEffect(() => {
        loadContract();
    }, [contractId]);

    useEffect(() => {
        if (canvasRef.current && !ctx) {
            initCanvas();
        }
    }, [canvasRef.current]);

    const loadContract = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/contract-templates/${contractId}/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setContract(data);
                
                if (data.status !== 'signed') {
                    alert('Ce contrat n\'est pas encore signé par le locataire');
                    navigate(-1);
                }
            } else {
                alert('Erreur lors du chargement du contrat');
                navigate(-1);
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement du contrat');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const initCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context.strokeStyle = '#1e293b';
            context.lineWidth = 2;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            setCtx(context);
        }
    };

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        if (e.touches && e.touches[0]) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        if (!ctx) return;
        
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing || !ctx) return;
        
        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(false);
        if (ctx) {
            ctx.closePath();
        }
    };

    const clearSignature = () => {
        if (!ctx || !canvasRef.current) return;
        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleApprove = async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            alert('Erreur de canvas');
            return;
        }
        
        const signatureData = canvas.toDataURL('image/png');
        
        // Vérifier que le canvas n'est pas vide
        const blankCanvas = document.createElement('canvas');
        blankCanvas.width = canvas.width;
        blankCanvas.height = canvas.height;
        if (signatureData === blankCanvas.toDataURL('image/png')) {
            alert('Veuillez signer pour approuver le contrat');
            return;
        }
        
        setApproving(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/contract-templates/${contractId}/approve/`, {
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
                navigate('/owner-dashboard'); // Ou vers la page appropriée
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Chargement du contrat...</p>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 font-medium mb-4">Contrat introuvable</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header fixe */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white sticky top-0 z-50 shadow-lg">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Approuver le Contrat</h1>
                                    <p className="text-slate-300 text-sm">Vérifiez et signez</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="container mx-auto px-6 py-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Informations du contrat */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 text-xl mb-6">Informations du Contrat</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-slate-600 text-sm mb-1">Locataire</p>
                                <p className="font-semibold text-slate-900">{contract.tenant_name || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-slate-600 text-sm mb-1">Email</p>
                                <p className="font-semibold text-slate-900">{contract.tenant_email || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-slate-600 text-sm mb-1">Propriété</p>
                                <p className="font-semibold text-slate-900">{contract.property_title || 'N/A'}</p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-slate-600 text-sm mb-1">Loyer Mensuel</p>
                                <p className="font-semibold text-slate-900 text-lg">
                                    {contract.monthly_rent?.toLocaleString() || '0'} FCFA
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Données remplies par le locataire */}
                    {contract.contract_data && (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-900 text-xl mb-6">Informations du Locataire</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-slate-600 text-sm mb-1">Nom Complet</p>
                                    <p className="font-semibold text-slate-900">{contract.contract_data.fullName || 'N/A'}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-slate-600 text-sm mb-1">Téléphone</p>
                                    <p className="font-semibold text-slate-900">{contract.contract_data.phone || 'N/A'}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-slate-600 text-sm mb-1">Pièce d'Identité</p>
                                    <p className="font-semibold text-slate-900">{contract.contract_data.idNumber || 'N/A'}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-slate-600 text-sm mb-1">Profession</p>
                                    <p className="font-semibold text-slate-900">{contract.contract_data.profession || 'N/A'}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-slate-600 text-sm mb-1">Adresse</p>
                                    <p className="font-semibold text-slate-900">{contract.contract_data.address || 'N/A'}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-slate-600 text-sm mb-1">Contact d'Urgence</p>
                                    <p className="font-semibold text-slate-900">
                                        {contract.contract_data.emergencyContact || 'N/A'} 
                                        {contract.contract_data.emergencyPhone && ` - ${contract.contract_data.emergencyPhone}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Signature du locataire */}
                    {contract.tenant_signature && (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-900 text-xl mb-4">Signature du Locataire</h3>
                            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                                <img 
                                    src={contract.tenant_signature} 
                                    alt="Signature du locataire"
                                    className="max-w-md mx-auto bg-white rounded-lg p-4 border border-green-300"
                                />
                                <p className="text-sm text-slate-600 mt-3 text-center">
                                    Signé le {new Date(contract.signed_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })} à {new Date(contract.signed_at).toLocaleTimeString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Signature du propriétaire */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 text-xl mb-2">
                            Votre Signature <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-sm text-slate-600 mb-6">
                            Signez dans le cadre ci-dessous pour approuver le contrat
                        </p>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50">
                            <canvas
                                ref={canvasRef}
                                width={800}
                                height={200}
                                className="border-2 border-slate-300 rounded-lg bg-white cursor-crosshair w-full touch-none"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="mt-4 px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                            >
                                Effacer la signature
                            </button>
                        </div>
                    </div>

                    {/* Avertissement */}
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={24} className="text-amber-600 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-amber-900 mb-2">Important</p>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    En signant ce contrat, vous confirmez avoir vérifié toutes les informations et approuvez 
                                    les termes de la location. Le contrat sera définitivement validé après votre signature.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-4 sticky bottom-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-200">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={approving}
                            className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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