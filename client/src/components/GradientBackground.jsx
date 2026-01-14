import React from 'react';

const GradientBackground = ({ children }) => {
    const styles = {
        globalStyles: `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body, html {
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                height: 100%;
            }
            
            @keyframes float {
                0%, 100% {
                    transform: translateY(0) rotate(0deg);
                }
                50% {
                    transform: translateY(-25px) rotate(180deg);
                }
            }
            .animate-float {
                animation: float 20s ease-in-out infinite;
            }
            
            /* Hide scrollbar for Chrome, Safari and Opera */
            .scroll-container::-webkit-scrollbar {
                display: none;
            }
            
            /* Hide scrollbar for IE, Edge and Firefox */
            .scroll-container {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }
        `
    };

    return (
        <>
            <style>{styles.globalStyles}</style>
            
            {/* Fixed Background Container - Doesn't scroll */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 50%, #0d9488 100%)',
                zIndex: 1,
            }}>
                {/* Animated Circles - Fixed position */}
                <div 
                    className="animate-float"
                    style={{
                        position: 'absolute',
                        top: '5rem',
                        left: '2.5rem',
                        width: '8rem',
                        height: '8rem',
                        borderRadius: '50%',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        animationDelay: '0s'
                    }}
                ></div>
                
                <div 
                    className="animate-float"
                    style={{
                        position: 'absolute',
                        top: '10rem',
                        left: '5rem',
                        width: '12rem',
                        height: '12rem',
                        borderRadius: '50%',
                        border: '1px solid rgba(244, 114, 182, 0.25)',
                        animationDelay: '1s'
                    }}
                ></div>
                
                <div 
                    className="animate-float"
                    style={{
                        position: 'absolute',
                        bottom: '10rem',
                        left: '25%',
                        width: '10rem',
                        height: '10rem',
                        borderRadius: '50%',
                        border: '1px solid rgba(192, 132, 252, 0.25)',
                        animationDelay: '2s'
                    }}
                ></div>
                
                <div 
                    className="animate-float"
                    style={{
                        position: 'absolute',
                        top: '33%',
                        right: '25%',
                        width: '14rem',
                        height: '14rem',
                        borderRadius: '50%',
                        border: '1px solid rgba(94, 234, 212, 0.25)',
                        animationDelay: '1.5s'
                    }}
                ></div>
                
                <div 
                    className="animate-float"
                    style={{
                        position: 'absolute',
                        bottom: '5rem',
                        right: '2.5rem',
                        width: '16rem',
                        height: '16rem',
                        borderRadius: '50%',
                        border: '1px solid rgba(45, 212, 191, 0.2)',
                        animationDelay: '2.5s'
                    }}
                ></div>

                {/* Solid Circles */}
                <div 
                    className="animate-float"
                    style={{
                        position: 'absolute',
                        top: '6rem',
                        left: '25%',
                        width: '5rem',
                        height: '5rem',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        animationDelay: '0.5s'
                    }}
                ></div>
                
                <div 
                    className="animate-float"
                    style={{
                        position: 'absolute',
                        bottom: '33%',
                        left: '33%',
                        width: '8rem',
                        height: '8rem',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        animationDelay: '3s'
                    }}
                ></div>
            </div>

            {/* Scrollable Content Container */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                minHeight: '100vh',
                overflowY: 'auto',
                overflowX: 'hidden',
            }} className="scroll-container">
                {children}
            </div>
        </>
    );
};

export default GradientBackground;