// CallComponent.tsx
import React, { useEffect, useRef } from 'react';
import { useWebRTC } from 'src/hooks/useWebRtc.ts';

interface CallComponentProps {
    callId: string;
    participants: Array<{ id: string, name: string }>;
    currentUserId: string;
}

const CallComponent: React.FC<CallComponentProps> = ({ callId, participants, currentUserId }) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideosRef = useRef<Record<string, HTMLVideoElement>>({});

    const {
        isConnected,
        localStream,
        remoteStreams,
        connectionState,
        initLocalMedia,
        callUser
    } = useWebRTC(callId, {
        onTrack: (stream, userId) => {
            // Cette fonction sera appelée quand un nouveau stream distant est reçu
            console.log(`Nouveau stream de ${userId}`);
        }
    });

    // Initialiser le média local au chargement
    useEffect(() => {
        const init = async () => {
            try {
                await initLocalMedia();
            } catch (error) {
                console.error('Impossible d\'accéder à la caméra/micro:', error);
            }
        };

        init();
    }, [initLocalMedia]);

    // Attacher le stream local à l'élément vidéo
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attacher les streams distants aux éléments vidéo
    useEffect(() => {
        Object.entries(remoteStreams).forEach(([userId, stream]) => {
            const videoElement = remoteVideosRef.current[userId];
            if (videoElement && videoElement.srcObject !== stream) {
                videoElement.srcObject = stream;
            }
        });
    }, [remoteStreams]);

    // Appeler automatiquement les autres participants
    useEffect(() => {
        if (isConnected && localStream) {
            participants
                .filter(p => p.id !== currentUserId)
                .forEach(participant => {
                    callUser(participant.id);
                });
        }
    }, [isConnected, localStream, participants, currentUserId, callUser]);

    return (
        <div className="call-container">
            <div className="connection-status">
                {isConnected ? 'Connecté' : 'Déconnecté'}
            </div>

            <div className="video-grid">
                <div className="local-video-container">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted // Important: Muter la vidéo locale pour éviter l'écho
                    />
                    <div className="participant-name">Vous</div>
                </div>

                {participants
                    .filter(p => p.id !== currentUserId)
                    .map(participant => (
                        <div key={participant.id} className="remote-video-container">
                            <video
                                ref={el => {
                                    if (el) remoteVideosRef.current[participant.id] = el;
                                }}
                                autoPlay
                                playsInline
                            />
                            <div className="participant-name">{participant.name}</div>
                            <div className="connection-state">
                                {connectionState[participant.id] || 'non connecté'}
                            </div>
                        </div>
                    ))}
            </div>

            <div className="call-controls">
                {/* Boutons pour couper le micro, la caméra, raccrocher, etc. */}
            </div>
        </div>
    );
};

export default CallComponent;