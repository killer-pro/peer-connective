// useWebRTC.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSignalingWebSocket } from './useWebSocket';

interface UseWebRTCOptions {
    onTrack?: (stream: MediaStream, userId: string) => void;
    onConnectionStateChange?: (state: RTCPeerConnectionState, userId: string) => void;
}

export const useWebRTC = (callId: string, options: UseWebRTCOptions = {}) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const [connectionState, setConnectionState] = useState<Record<string, RTCPeerConnectionState>>({});

    const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
    const localStreamRef = useRef<MediaStream | null>(null);

    // Configuration WebRTC
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            // Ajoutez vos serveurs TURN ici pour une meilleure traversée NAT
        ]
    };

    // Initialiser le hook WebSocket pour la signalisation
    const { isConnected, send, subscribe } = useSignalingWebSocket(callId, {
        onOpen: () => console.log('Signaling WebSocket connecté'),
        onClose: () => console.log('Signaling WebSocket déconnecté'),
        onError: (error) => console.error('Erreur WebSocket:', error)
    });

    // Créer une connexion peer pour un utilisateur spécifique
    const createPeerConnection = useCallback((userId: string) => {
        if (peerConnectionsRef.current[userId]) {
            return peerConnectionsRef.current[userId];
        }

        console.log(`Création d'une connexion peer pour l'utilisateur ${userId}`);
        const peerConnection = new RTCPeerConnection(rtcConfig);
        peerConnectionsRef.current[userId] = peerConnection;

        // Ajouter les tracks du stream local
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                if (localStreamRef.current) {
                    peerConnection.addTrack(track, localStreamRef.current);
                }
            });
        }

        // Gérer les tracks entrants
        peerConnection.ontrack = (event) => {
            console.log(`Nouveau track reçu de l'utilisateur ${userId}`);
            const stream = event.streams[0];
            setRemoteStreams(prev => ({ ...prev, [userId]: stream }));

            if (options.onTrack) {
                options.onTrack(stream, userId);
            }
        };

        // Gérer les candidats ICE
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                send({
                    type: 'ice-candidate',
                    receiver: userId,
                    callId: callId,
                    candidate: event.candidate
                });
            }
        };

        // Gérer les changements d'état de connexion
        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            console.log(`État de connexion avec ${userId}: ${state}`);

            setConnectionState(prev => ({ ...prev, [userId]: state }));

            if (options.onConnectionStateChange) {
                options.onConnectionStateChange(state, userId);
            }

            // Nettoyer les connexions fermées
            if (state === 'closed' || state === 'failed' || state === 'disconnected') {
                setTimeout(() => {
                    // Si l'état n'a pas changé après un délai
                    if (peerConnectionsRef.current[userId]?.connectionState === state) {
                        delete peerConnectionsRef.current[userId];
                        setRemoteStreams(prev => {
                            const newState = { ...prev };
                            delete newState[userId];
                            return newState;
                        });
                    }
                }, 5000);
            }
        };

        return peerConnection;
    }, [callId, send, options]);

    // Initialiser le media local
    const initLocalMedia = useCallback(async (constraints = { audio: true, video: true }) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            localStreamRef.current = stream;
            setLocalStream(stream);

            // Ajouter les tracks aux connexions existantes
            Object.entries(peerConnectionsRef.current).forEach(([userId, pc]) => {
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });
            });

            return stream;
        } catch (error) {
            console.error('Erreur lors de l\'accès aux médias:', error);
            throw error;
        }
    }, []);

    // Initier un appel à un utilisateur
    const callUser = useCallback(async (userId: string) => {
        if (!localStreamRef.current) {
            await initLocalMedia();
        }

        const peerConnection = createPeerConnection(userId);

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            send({
                type: 'offer',
                receiver: userId,
                callId: callId,
                sender: 'currentUserId', // Remplacer par l'ID de l'utilisateur actuel
                sdp: peerConnection.localDescription
            });

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'initiation de l\'appel:', error);
            return false;
        }
    }, [callId, createPeerConnection, initLocalMedia, send]);

    // Gérer les messages de signalisation entrants
    useEffect(() => {
        // Gestionnaire d'offres
        const handleOffer = async (message: any) => {
            const { sender, sdp } = message;
            console.log(`Offre reçue de l'utilisateur ${sender}`);

            if (!localStreamRef.current) {
                await initLocalMedia();
            }

            const peerConnection = createPeerConnection(sender);

            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                send({
                    type: 'answer',
                    receiver: sender,
                    callId: callId,
                    sender: 'currentUserId', // Remplacer par l'ID de l'utilisateur actuel
                    sdp: peerConnection.localDescription
                });
            } catch (error) {
                console.error('Erreur lors du traitement de l\'offre:', error);
            }
        };

        // Gestionnaire de réponses
        const handleAnswer = async (message: any) => {
            const { sender, sdp } = message;
            console.log(`Réponse reçue de l'utilisateur ${sender}`);

            const peerConnection = peerConnectionsRef.current[sender];
            if (peerConnection) {
                try {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
                } catch (error) {
                    console.error('Erreur lors du traitement de la réponse:', error);
                }
            }
        };

        // Gestionnaire de candidats ICE
        const handleIceCandidate = async (message: any) => {
            const { sender, candidate } = message;

            const peerConnection = peerConnectionsRef.current[sender];
            if (peerConnection) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error('Erreur lors de l\'ajout du candidat ICE:', error);
                }
            }
        };

        // S'abonner aux messages
        const unsubOffer = subscribe('offer', handleOffer);
        const unsubAnswer = subscribe('answer', handleAnswer);
        const unsubIceCandidate = subscribe('ice-candidate', handleIceCandidate);

        return () => {
            unsubOffer();
            unsubAnswer();
            unsubIceCandidate();
        };
    }, [callId, createPeerConnection, initLocalMedia, send, subscribe]);

    // Nettoyer les ressources lors du démontage
    useEffect(() => {
        return () => {
            // Fermer toutes les connexions peer
            Object.values(peerConnectionsRef.current).forEach(pc => {
                pc.close();
            });

            // Arrêter tous les tracks du stream local
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
            }
        };
    }, []);

    return {
        isConnected,
        localStream,
        remoteStreams,
        connectionState,
        initLocalMedia,
        callUser
    };
};