const app = {
    currentView: 'view-landing',
    burnoutLevel: 45,
    selectedEmotions: [],
    chatCount: 2,
    isEmergency: false,
    emergencyKeywords: ['자살', '자해', 'suicide', '죽고', '끝내고'],
    
    // Chat state
    chatMessages: [
        {
            id: 1,
            author: '지은 (Ji-eun)',
            avatar: 'J',
            text: '요즘 번아웃 때문에 집중하기가 너무 힘들어요. 혹시 다들 어떻게 극복하시나요?',
            translation: "I've been finding it so hard to focus lately because of burnout. How does everyone deal with it?",
            isMe: false
        },
        {
            id: 2,
            author: '민호 (Min-ho)',
            avatar: 'M',
            text: '저는 15분 정도 짧게 명상을 하니까 훨씬 나아지더라고요. 완벽해야 한다는 생각을 내려놓는 게 중요한 것 같아요.',
            translation: "I find that short 15-minute meditations really help. I think letting go of the need to be perfect is key.",
            isMe: false
        },
        {
            id: 3,
            author: '나 (Me)',
            avatar: '나',
            text: '민호님 말씀대로 작은 성취에 집중하는 것도 큰 도움이 되는 것 같아요. 오늘은 그냥 이 자리에 온 것만으로도 잘하신 거예요.',
            translation: "I think focusing on small achievements, like Min-ho said, really helps too. You did well just by showing up here today.",
            isMe: true
        },
        {
            id: 4,
            author: '성진 (Sung-jin)',
            avatar: 'S',
            text: '맞아요. 저도 지은님의 마음을 충분히 이해해요. 혼자가 아니라는 것만으로도 힘이 나네요.',
            translation: "That's right. I fully understand how Ji-eun feels. It gives me strength just knowing I'm not alone.",
            isMe: false
        }
    ],

    init() {
        this.bindEvents();
        this.renderChat();
    },

    bindEvents() {
        // Slider
        const slider = document.getElementById('burnoutSlider');
        const display = document.getElementById('burnoutValue');
        
        slider.addEventListener('input', (e) => {
            this.burnoutLevel = e.target.value;
            display.textContent = `${this.burnoutLevel}%`;
        });
        
        // Sound toggles (Visual only for MVP)
        document.getElementById('musicToggle').addEventListener('click', function() {
            this.classList.toggle('active');
            this.style.color = this.classList.contains('active') ? 'var(--secondary)' : 'inherit';
        });
        
        document.getElementById('soundToggle').addEventListener('click', function() {
            this.classList.toggle('active');
            this.style.color = this.classList.contains('active') ? 'var(--secondary)' : 'inherit';
        });

        // Voice Check-in Long Press
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            let pressTimer;
            const startRecord = (e) => {
                e.preventDefault(); // prevent text selection
                pressTimer = setTimeout(() => {
                    voiceBtn.style.transform = 'scale(1.2)';
                    voiceBtn.style.boxShadow = '0 0 30px rgba(177, 124, 198, 0.8)';
                    console.log("Recording started...");
                }, 300); // 300ms for long press
            };
            const stopRecord = () => {
                clearTimeout(pressTimer);
                if (voiceBtn.style.transform === 'scale(1.2)') {
                    voiceBtn.style.transform = '';
                    voiceBtn.style.boxShadow = '';
                    console.log("Recording stopped. Voice check-in recorded.");
                    alert("목소리가 기록되었습니다. AI가 감정을 분석합니다.");
                }
            };
            voiceBtn.addEventListener('mousedown', startRecord);
            voiceBtn.addEventListener('mouseup', stopRecord);
            voiceBtn.addEventListener('mouseleave', stopRecord);
            voiceBtn.addEventListener('touchstart', startRecord);
            voiceBtn.addEventListener('touchend', stopRecord);
        }

        // Comfort Room Click Ripple
        const comfortContainer = document.getElementById('comfortContainer');
        if (comfortContainer) {
            comfortContainer.addEventListener('click', (e) => {
                // Ignore clicks on buttons or interactive elements
                if (e.target.closest('button') || e.target.closest('.breathing-circle')) return;
                
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                
                // Calculate position relative to container
                const rect = comfortContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                ripple.style.width = '100px';
                ripple.style.height = '100px';
                comfortContainer.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 2000);
            });
        }
    },

    navigateTo(viewId) {
        // Hide current
        document.getElementById(this.currentView).classList.remove('active');
        
        // Update state
        this.currentView = viewId;
        
        // If navigating to report, update the report data
        if (viewId === 'view-report') {
            this.updateReportView();
        } else if (viewId === 'view-comfort') {
            this.initComfortRoom();
        }
        
        // Show new
        document.getElementById(viewId).classList.add('active');
    },

    selectEmotion(emotion, btnElement) {
        const index = this.selectedEmotions.indexOf(emotion);
        if (index > -1) {
            // Already selected, so remove it
            this.selectedEmotions.splice(index, 1);
            btnElement.classList.remove('selected');
        } else {
            // Add it
            this.selectedEmotions.push(emotion);
            btnElement.classList.add('selected');
        }
        
        // Check emergency
        if (this.selectedEmotions.includes('지쳐요') && this.burnoutLevel > 80) {
            this.triggerEmergency();
        }
    },

    // finishCheckin removed as it's handled directly by navigation in HTML
    triggerEmergency() {
        this.isEmergency = true;
        const btn = document.getElementById('emergencyBtn');
        btn.style.display = 'block';
        btn.classList.add('pulse');
    },

    updateReportView() {
        const val = this.burnoutLevel;
        document.getElementById('reportBurnoutVal').textContent = `${val}%`;
        document.getElementById('reportProgressBar').style.width = `${val}%`;
        
        const levelText = document.querySelector('.level-text');
        if (val > 80) {
            levelText.textContent = 'LEVEL: CRITICAL';
            levelText.style.color = '#FF6B6B';
        } else if (val > 50) {
            levelText.textContent = 'LEVEL: WARNING';
            levelText.style.color = '#FFA07A';
        } else {
            levelText.textContent = 'LEVEL: STABLE';
            levelText.style.color = 'var(--secondary)';
        }
    },

    initComfortRoom() {
        const container = document.getElementById('comfortContainer');
        if (!container) return;
        
        // Clear existing orbs
        container.querySelectorAll('.floating-orb').forEach(orb => orb.remove());
        
        const numPeople = 12; // "현재 12명의 빛이 함께하고 있습니다"
        for (let i = 0; i < numPeople; i++) {
            const orb = document.createElement('div');
            orb.className = 'floating-orb';
            
            const x = Math.random() * 90 + 5; // 5% to 95%
            const y = Math.random() * 90 + 5;
            orb.style.left = `${x}%`;
            orb.style.top = `${y}%`;
            
            const delay = Math.random() * 10;
            const duration = 10 + Math.random() * 15; // 10s to 25s
            orb.style.animationDelay = `-${delay}s`;
            orb.style.animationDuration = `${duration}s`;
            
            container.appendChild(orb);
        }
    },

    // Chat functionality
    renderChat() {
        const container = document.getElementById('chatMessages');
        container.innerHTML = '';
        
        this.chatMessages.forEach(msg => {
            const msgHtml = `
                <div class="message ${msg.isMe ? 'me' : ''}">
                    <div class="avatar">${msg.avatar}</div>
                    <div class="msg-content">
                        <div class="msg-author">${msg.author}</div>
                        <div class="msg-bubble">
                            <div class="msg-text">${msg.text}</div>
                            ${msg.translation ? `<div class="msg-translation">${msg.translation}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', msgHtml);
        });
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    handleChatEnter(e) {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    },

    sendMessage() {
        if (this.chatCount >= 3) return;

        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        
        if (!text) return;
        
        // Check for emergency keywords
        const isDanger = this.emergencyKeywords.some(keyword => text.includes(keyword));
        if (isDanger) {
            this.triggerEmergency();
            alert("긴급 상황이 감지되었습니다. 상단의 긴급 핫라인 버튼을 통해 전문 기관의 도움을 받으세요.");
        }
        
        // Add message
        this.chatMessages.push({
            id: Date.now(),
            author: '나 (Me)',
            avatar: '나',
            text: text,
            translation: "Processing translation...", // Mock translation
            isMe: true
        });
        
        input.value = '';
        this.chatCount++;
        document.getElementById('chatLimitValue').textContent = `${this.chatCount}/3`;
        this.renderChat();

        if (this.chatCount >= 3) {
            setTimeout(() => {
                document.getElementById('chatLimitModal').style.display = 'flex';
            }, 500);
        }
    },

    closeChatLimitModal() {
        document.getElementById('chatLimitModal').style.display = 'none';
        this.navigateTo('view-report');
    },

    openAttachment() {
        // Simulate file/link attachment popup
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                alert(`"${e.target.files[0].name}" 사진이 첨부되었습니다.`);
            }
        };
        input.click();
    },

    openEmoticon() {
        const picker = document.getElementById('emoticonPicker');
        if (picker.style.display === 'none') {
            picker.style.display = 'block';
        } else {
            picker.style.display = 'none';
        }
    },

    insertEmoticon(emoji) {
        const input = document.getElementById('chatInput');
        input.value += emoji;
        input.focus();
        document.getElementById('emoticonPicker').style.display = 'none';
    }
};

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
