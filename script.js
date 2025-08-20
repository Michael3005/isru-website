// Audio state management
let audioEnabled = true; // always on
let ambientEnabled = true; // always on
let currentStreak = 0;
let audioContext = null;
let ambientIntervalId = null;

// ISRU API Integration
let currentISRUUser = null;

// Add CSS protection to prevent task state changes during scroll
function addCSSProtection() {
	const style = document.createElement('style');
	style.textContent = `
		/* Prevent any CSS from interfering with task states */
		.task.completed {
			/* Force completed state to persist */
			background-color: rgba(0, 255, 0, 0.1) !important;
			border-color: #00ff00 !important;
		}
		
		/* Disable any CSS animations that might reset state */
		.task {
			transition: none !important;
			animation: none !important;
		}
		
		/* Ensure completed state is visually distinct */
		.task.completed::before {
			content: "✓";
			color: #00ff00;
			font-weight: bold;
			margin-right: 10px;
		}
	`;
	document.head.appendChild(style);
	console.log('🛡️ CSS protection added');
}

// Initialize the checklist
document.addEventListener('DOMContentLoaded', function() {
	// Force scroll to top on page load - multiple methods for compatibility
	setTimeout(() => {
		window.scrollTo(0, 0);
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
	}, 100);
	
	// Add CSS protection first
	addCSSProtection();
	
	loadChecklistState();
	updateProgress();
	loadStreak();
	setupDragAndDrop();
	setupCursorTrail();
	setupParticleEffects();
	setupAudioContext();
	initAmbientStars();
	setupAmbientParallax();
	resumeAudioOnFirstInteraction();
	
	// Check if we're on mobile
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window;
	console.log('📱 Mobile detection result:', isMobile);
	
	if (isMobile) {
		// MOBILE: Use only touchstart/touchend with strict gesture detection
		setupMobileTaskHandling();
		// Add mobile scroll protection
		addMobileScrollProtection();
		// Add nuclear protection
		addNuclearTaskProtection();
	} else {
		// DESKTOP: Use regular click events
		setupDesktopTaskHandling();
	}
	
	// Create visual debug panel for mobile
	if (isMobile) {
		createMobileDebugPanel();
	}
	
	// Add keyboard shortcuts
	setupKeyboardShortcuts();
	
	// Setup mobile-specific optimizations
	setupMobileOptimizations();
	
	// Add aggressive task state monitoring
	addTaskStateMonitoring();
	
	// Add audio test button
	addAudioTestButton();
	
	// Add ISRU user login
	addISRUUserLogin();
});

// Add audio test button
function addAudioTestButton() {
	const testButton = document.createElement('button');
	testButton.textContent = ' Test Audio';
	testButton.style.cssText = `
		position: fixed;
		top: 10px;
		left: 10px;
		z-index: 10000;
		padding: 10px;
		background: #e31837;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 12px;
	`;
	
	testButton.onclick = testAudio;
	document.body.appendChild(testButton);
	
	console.log('🔊 Audio test button added');
}

// Test audio function
function testAudio() {
	console.log('🔊 Testing audio...');
	
	// Resume audio context if suspended
	if (audioContext && audioContext.state === 'suspended') {
		audioContext.resume().then(() => {
			console.log('🎵 Audio context resumed for test');
			generateRocketSound();
		}).catch(error => {
			console.error('❌ Failed to resume audio context:', error);
		});
	} else if (audioContext) {
		console.log('🎵 Audio context already running, testing sound');
		generateRocketSound();
	} else {
		console.log('🎵 No audio context, creating new one');
		setupAudioContext();
		setTimeout(() => {
			generateRocketSound();
		}, 100);
	}
}

// Mobile-specific task handling
function setupMobileTaskHandling() {
	console.log('📱 Setting up mobile task handling');
	const tasks = document.querySelectorAll('.task');
	
	tasks.forEach((task) => {
		let touchStartY = 0;
		let touchStartTime = 0;
		let isScrolling = false;
		let scrollTimeout = null;
		
		// Touch start - record initial position
		task.addEventListener('touchstart', function(e) {
			touchStartY = e.touches[0].clientY;
			touchStartTime = Date.now();
			isScrolling = false;
			
			// Clear any existing timeout
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
			
			console.log('📱 Touch start on task:', task.dataset.task);
		}, { passive: true });
		
		// Touch move - detect scroll gestures
		task.addEventListener('touchmove', function(e) {
			const currentY = e.touches[0].clientY;
			const deltaY = Math.abs(currentY - touchStartY);
			
			if (deltaY > 15) {
				isScrolling = true;
				console.log(' Scroll detected on task:', task.dataset.task);
				
				// Set a timeout to mark scrolling as finished
				if (scrollTimeout) {
					clearTimeout(scrollTimeout);
				}
				scrollTimeout = setTimeout(() => {
					isScrolling = false;
					console.log(' Scroll finished on task:', task.dataset.task);
				}, 500);
			}
		}, { passive: true });
		
		// Touch end - only handle if it wasn't a scroll
		task.addEventListener('touchend', function(e) {
			const touchEndTime = Date.now();
			const touchDuration = touchEndTime - touchStartTime;
			const currentY = e.changedTouches[0].clientY;
			const deltaY = Math.abs(currentY - touchStartY);
			
			console.log('📱 Touch end on task:', task.dataset.task, {
				duration: touchDuration,
				deltaY: deltaY,
				isScrolling: isScrolling
			});
			
			// Only handle as tap if it wasn't a scroll and was quick
			if (!isScrolling && touchDuration < 500 && deltaY < 20) {
				console.log(' Valid tap detected - handling task');
				e.preventDefault();
				e.stopPropagation();
				handleMobileTaskTap(e);
			} else {
				console.log('📱 Ignoring touch - was scroll or too long');
			}
		}, { passive: false });
		
		// Ensure task is clickable
		task.style.cursor = 'pointer';
		task.setAttribute('tabindex', '0');
		
		console.log('✅ Mobile event listeners added to task:', task.dataset.task);
	});
}

// Desktop-specific task handling
function setupDesktopTaskHandling() {
	console.log('🖥️ Setting up desktop task handling');
	const tasks = document.querySelectorAll('.task');
	
	tasks.forEach((task) => {
		task.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			handleDesktopTaskClick(e);
		});
		
		// Ensure task is clickable
		task.style.cursor = 'pointer';
		task.setAttribute('tabindex', '0');
		
		console.log('✅ Desktop event listeners added to task:', task.dataset.task);
	});
}

// Mobile task tap handler
function handleMobileTaskTap(event) {
	const task = event.currentTarget;
	const taskId = task.dataset.task;
	const isCompleted = task.classList.contains('completed');
	
	console.log(' Mobile task tap:', taskId, isCompleted ? 'completed' : 'incomplete');
	
	// Add visual feedback
	task.style.transform = 'scale(0.95)';
	setTimeout(() => {
		task.style.transform = 'scale(1)';
	}, 150);
	
	toggleTask(event);
}

// Desktop task click handler
function handleDesktopTaskClick(event) {
	const task = event.currentTarget;
	const taskId = task.dataset.task;
	const isCompleted = task.classList.contains('completed');
	
	console.log('🖥️ Desktop task click:', taskId, isCompleted ? 'completed' : 'incomplete');
	
	toggleTask(event);
}

function resumeAudioOnFirstInteraction() {
	if (audioContext && audioContext.state === 'suspended') {
		audioContext.resume().then(() => {
			console.log('🎵 Audio context resumed successfully');
		}).catch(error => {
			console.error('❌ Failed to resume audio context:', error);
		});
	} else if (!audioContext) {
		console.log(' Creating new audio context');
		setupAudioContext();
	}
}

// Setup Web Audio API
function setupAudioContext() {
	try {
		audioContext = new (window.AudioContext || window.webkitAudioContext)();
		console.log('🎵 Audio context created successfully, state:', audioContext.state);
		
		// Try to resume immediately if possible
		if (audioContext.state === 'suspended') {
			audioContext.resume().then(() => {
				console.log('🎵 Audio context resumed during setup');
			}).catch(error => {
				console.error('❌ Failed to resume audio context during setup:', error);
			});
		}
	} catch (e) {
		console.error('❌ Error creating audio context:', e);
	}
}

// Enhanced audio generation functions with advanced processing
function generateRocketSound() {
	// Ensure audio context is resumed
	resumeAudioOnFirstInteraction();
	
	if (!audioContext || !audioEnabled) {
		console.log('❌ Audio context not available or disabled');
		return;
	}
	
	// Check if audio context is running
	if (audioContext.state !== 'running') {
		console.log('🎵 Audio context not running, attempting to resume...');
		audioContext.resume().then(() => {
			console.log('🎵 Audio context resumed, now generating sound');
			generateRocketSoundInternal();
		}).catch(error => {
			console.error('❌ Failed to resume audio context:', error);
		});
		return;
	}
	
	generateRocketSoundInternal();
}

// Internal rocket sound generation
function generateRocketSoundInternal() {
	console.log('🚀 Generating rocket sound...');
	
	// Engine ignition with multiple layers
	const ignition1 = audioContext.createOscillator();
	const ignition1Gain = audioContext.createGain();
	const ignition1Filter = audioContext.createBiquadFilter();
	
	ignition1.connect(ignition1Filter);
	ignition1Filter.connect(ignition1Gain);
	ignition1Gain.connect(audioContext.destination);
	
	ignition1.frequency.setValueAtTime(120, audioContext.currentTime);
	ignition1.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.4);
	ignition1Filter.type = 'lowpass';
	ignition1Filter.frequency.setValueAtTime(300, audioContext.currentTime);
	ignition1Filter.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.4);
	
	ignition1Gain.gain.setValueAtTime(0, audioContext.currentTime);
	ignition1Gain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
	ignition1Gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
	
	ignition1.start(audioContext.currentTime);
	ignition1.stop(audioContext.currentTime + 0.8);
	
	// Second ignition layer (higher frequency)
	setTimeout(() => {
		const ignition2 = audioContext.createOscillator();
		const ignition2Gain = audioContext.createGain();
		const ignition2Filter = audioContext.createBiquadFilter();
		
		ignition2.connect(ignition2Filter);
		ignition2Filter.connect(ignition2Gain);
		ignition2Gain.connect(audioContext.destination);
		
		ignition2.frequency.setValueAtTime(200, audioContext.currentTime);
		ignition2.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
		ignition2Filter.type = 'highpass';
		ignition2Filter.frequency.setValueAtTime(150, audioContext.currentTime);
		
		ignition2Gain.gain.setValueAtTime(0, audioContext.currentTime);
		ignition2Gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
		ignition2Gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
		
		ignition2.start(audioContext.currentTime);
		ignition2.stop(audioContext.currentTime + 0.6);
	}, 50);
	
	// Engine roar with multiple oscillators
	setTimeout(() => {
		// Main engine roar
		const roar1 = audioContext.createOscillator();
		const roar1Gain = audioContext.createGain();
		const roar1Filter = audioContext.createBiquadFilter();
		
		roar1.connect(roar1Filter);
		roar1Filter.connect(roar1Gain);
		roar1Gain.connect(audioContext.destination);
		
		roar1.type = 'sawtooth';
		roar1.frequency.setValueAtTime(80, audioContext.currentTime);
		roar1.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 1.5);
		
		roar1Filter.type = 'lowpass';
		roar1Filter.frequency.setValueAtTime(250, audioContext.currentTime);
		roar1Filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1.5);
		
		roar1Gain.gain.setValueAtTime(0, audioContext.currentTime);
		roar1Gain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.3);
		roar1Gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
		
		roar1.start(audioContext.currentTime);
		roar1.stop(audioContext.currentTime + 1.5);
		
		// Secondary engine harmonics
		const roar2 = audioContext.createOscillator();
		const roar2Gain = audioContext.createGain();
		const roar2Filter = audioContext.createBiquadFilter();
		
		roar2.connect(roar2Filter);
		roar2Filter.connect(roar2Gain);
		roar2Gain.connect(audioContext.destination);
		
		roar2.type = 'square';
		roar2.frequency.setValueAtTime(160, audioContext.currentTime);
		roar2.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 1.3);
		
		roar2Filter.type = 'bandpass';
		roar2Filter.frequency.setValueAtTime(400, audioContext.currentTime);
		roar2Filter.Q.setValueAtTime(3, audioContext.currentTime);
		
		roar2Gain.gain.setValueAtTime(0, audioContext.currentTime);
		roar2Gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.2);
		roar2Gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.3);
		
		roar2.start(audioContext.currentTime);
		roar2.stop(audioContext.currentTime + 1.3);
	}, 150);
	
	// Whoosh effects with multiple layers
	setTimeout(() => {
		// Main whoosh
		const whoosh1 = audioContext.createOscillator();
		const whoosh1Gain = audioContext.createGain();
		const whoosh1Filter = audioContext.createBiquadFilter();
		
		whoosh1.connect(whoosh1Filter);
		whoosh1Filter.connect(whoosh1Gain);
		whoosh1Gain.connect(audioContext.destination);
		
		whoosh1.type = 'sine';
		whoosh1.frequency.setValueAtTime(500, audioContext.currentTime);
		whoosh1.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.8);
		
		whoosh1Filter.type = 'highpass';
		whoosh1Filter.frequency.setValueAtTime(400, audioContext.currentTime);
		whoosh1Filter.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.8);
		
		whoosh1Gain.gain.setValueAtTime(0, audioContext.currentTime);
		whoosh1Gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
		whoosh1Gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
		
		whoosh1.start(audioContext.currentTime);
		whoosh1.stop(audioContext.currentTime + 0.8);
		
		// Secondary whoosh (lower frequency)
		const whoosh2 = audioContext.createOscillator();
		const whoosh2Gain = audioContext.createGain();
		
		whoosh2.connect(whoosh2Gain);
		whoosh2Gain.connect(audioContext.destination);
		
		whoosh2.type = 'triangle';
		whoosh2.frequency.setValueAtTime(300, audioContext.currentTime);
		whoosh2.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.6);
		
		whoosh2Gain.gain.setValueAtTime(0, audioContext.currentTime);
		whoosh2Gain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1);
		whoosh2Gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
		
		whoosh2.start(audioContext.currentTime);
		whoosh2.stop(audioContext.currentTime + 0.6);
	}, 250);
	
	// Engine shutdown effect
	setTimeout(() => {
		const shutdown = audioContext.createOscillator();
		const shutdownGain = audioContext.createGain();
		const shutdownFilter = audioContext.createBiquadFilter();
		
		shutdown.connect(shutdownFilter);
		shutdownFilter.connect(shutdownGain);
		shutdownGain.connect(audioContext.destination);
		
		shutdown.type = 'sawtooth';
		shutdown.frequency.setValueAtTime(60, audioContext.currentTime);
		shutdown.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.4);
		
		shutdownFilter.type = 'lowpass';
		shutdownFilter.frequency.setValueAtTime(200, audioContext.currentTime);
		shutdownFilter.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.4);
		
		shutdownGain.gain.setValueAtTime(0.2, audioContext.currentTime);
		shutdownGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
		
		shutdown.start(audioContext.currentTime);
		shutdown.stop(audioContext.currentTime + 0.4);
	}, 1800);
}

function generateMissionControlBeep() {
	if (!audioContext || !audioEnabled) return;
	
	// Mission control voice with multiple tones
	const voice1 = audioContext.createOscillator();
	const voice1Gain = audioContext.createGain();
	const voice1Filter = audioContext.createBiquadFilter();
	
	voice1.connect(voice1Filter);
	voice1Filter.connect(voice1Gain);
	voice1Gain.connect(audioContext.destination);
	
	voice1.type = 'sine';
	voice1.frequency.setValueAtTime(140, audioContext.currentTime);
	voice1.frequency.setValueAtTime(160, audioContext.currentTime + 0.1);
	voice1.frequency.setValueAtTime(140, audioContext.currentTime + 0.2);
	
	voice1Filter.type = 'bandpass';
	voice1Filter.frequency.setValueAtTime(800, audioContext.currentTime);
	voice1Filter.Q.setValueAtTime(10, audioContext.currentTime);
	
	voice1Gain.gain.setValueAtTime(0, audioContext.currentTime);
	voice1Gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
	voice1Gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
	
	voice1.start(audioContext.currentTime);
	voice1.stop(audioContext.currentTime + 0.25);
	
	// Secondary voice layer
	setTimeout(() => {
		const voice2 = audioContext.createOscillator();
		const voice2Gain = audioContext.createGain();
		const voice2Filter = audioContext.createBiquadFilter();
		
		voice2.connect(voice2Filter);
		voice2Filter.connect(voice2Gain);
		voice2Gain.connect(audioContext.destination);
		
		voice2.type = 'sine';
		voice2.frequency.setValueAtTime(120, audioContext.currentTime);
		voice2.frequency.setValueAtTime(140, audioContext.currentTime + 0.1);
		voice2.frequency.setValueAtTime(120, audioContext.currentTime + 0.2);
		
		voice2Filter.type = 'bandpass';
		voice2Filter.frequency.setValueAtTime(600, audioContext.currentTime);
		voice2Filter.Q.setValueAtTime(8, audioContext.currentTime);
		
		voice2Gain.gain.setValueAtTime(0, audioContext.currentTime);
		voice2Gain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
		voice2Gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
		
		voice2.start(audioContext.currentTime);
		voice2.stop(audioContext.currentTime + 0.25);
	}, 50);
	
	// Confirmation beep sequence
	setTimeout(() => {
		// First beep
		const beep1 = audioContext.createOscillator();
		const beep1Gain = audioContext.createGain();
		
		beep1.connect(beep1Gain);
		beep1Gain.connect(audioContext.destination);
		
		beep1.frequency.setValueAtTime(800, audioContext.currentTime);
		beep1.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
		
		beep1Gain.gain.setValueAtTime(0, audioContext.currentTime);
		beep1Gain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.05);
		beep1Gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
		
		beep1.start(audioContext.currentTime);
		beep1.stop(audioContext.currentTime + 0.15);
		
		// Second beep (higher)
		setTimeout(() => {
			const beep2 = audioContext.createOscillator();
			const beep2Gain = audioContext.createGain();
			
			beep2.connect(beep2Gain);
			beep2Gain.connect(audioContext.destination);
			
			beep2.frequency.setValueAtTime(1000, audioContext.currentTime);
			beep2.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
			
			beep2Gain.gain.setValueAtTime(0, audioContext.currentTime);
			beep2Gain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.05);
			beep2Gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
			
			beep2.start(audioContext.currentTime);
			beep2.stop(audioContext.currentTime + 0.15);
		}, 200);
	}, 300);
}

function generateCelebrationMusic() {
	if (!audioContext || !audioEnabled) return;
	
	// Victory fanfare with multiple instruments
	const notes = [
		{ freq: 523, duration: 0.4, type: 'sine' },      // C
		{ freq: 659, duration: 0.4, type: 'sine' },      // E
		{ freq: 784, duration: 0.4, type: 'sine' },      // G
		{ freq: 1047, duration: 0.8, type: 'sine' },     // C (high)
		{ freq: 784, duration: 0.3, type: 'triangle' },  // G
		{ freq: 1047, duration: 1.0, type: 'sine' }      // C (high, sustained)
	];
	
	notes.forEach((note, index) => {
		setTimeout(() => {
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();
			const filter = audioContext.createBiquadFilter();
			
			oscillator.connect(filter);
			filter.connect(gainNode);
			gainNode.connect(audioContext.destination);
			
			oscillator.type = note.type;
			oscillator.frequency.setValueAtTime(note.freq, audioContext.currentTime);
			
			filter.type = 'lowpass';
			filter.frequency.setValueAtTime(2500, audioContext.currentTime);
			
			gainNode.gain.setValueAtTime(0, audioContext.currentTime);
			gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.duration);
			
			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + note.duration);
		}, index * 180);
	});
	
	// Bass line
	setTimeout(() => {
		const bass = audioContext.createOscillator();
		const bassGain = audioContext.createGain();
		const bassFilter = audioContext.createBiquadFilter();
		
		bass.connect(bassFilter);
		bassFilter.connect(bassGain);
		bassGain.connect(audioContext.destination);
		
		bass.type = 'sawtooth';
		bass.frequency.setValueAtTime(130, audioContext.currentTime);
		bass.frequency.setValueAtTime(165, audioContext.currentTime + 0.4);
		bass.frequency.setValueAtTime(130, audioContext.currentTime + 0.8);
		
		bassFilter.type = 'lowpass';
		bassFilter.frequency.setValueAtTime(300, audioContext.currentTime);
		
		bassGain.gain.setValueAtTime(0, audioContext.currentTime);
		bassGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
		bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);
		
		bass.start(audioContext.currentTime);
		bass.stop(audioContext.currentTime + 1.2);
	}, 400);
	
	// Celebration whoosh effects
	setTimeout(() => {
		for (let i = 0; i < 5; i++) {
			setTimeout(() => {
				const whoosh = audioContext.createOscillator();
				const whooshGain = audioContext.createGain();
				const whooshFilter = audioContext.createBiquadFilter();
				
				whoosh.connect(whooshFilter);
				whooshFilter.connect(whooshGain);
				whooshGain.connect(audioContext.destination);
				
				whoosh.type = 'sine';
				whoosh.frequency.setValueAtTime(400 + Math.random() * 300, audioContext.currentTime);
				whoosh.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.5);
				
				whooshFilter.type = 'highpass';
				whooshFilter.frequency.setValueAtTime(350, audioContext.currentTime);
				
				whooshGain.gain.setValueAtTime(0, audioContext.currentTime);
				whooshGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
				whooshGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
				
				whoosh.start(audioContext.currentTime);
				whoosh.stop(audioContext.currentTime + 0.5);
			}, i * 150);
		}
	}, 1000);
	
	// Final victory blast
	setTimeout(() => {
		const blast = audioContext.createOscillator();
		const blastGain = audioContext.createGain();
		const blastFilter = audioContext.createBiquadFilter();
		
		blast.connect(blastFilter);
		blastFilter.connect(blastGain);
		blastGain.connect(audioContext.destination);
		
		blast.type = 'sawtooth';
		blast.frequency.setValueAtTime(200, audioContext.currentTime);
		blast.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.6);
		
		blastFilter.type = 'lowpass';
		blastFilter.frequency.setValueAtTime(400, audioContext.currentTime);
		blastFilter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.6);
		
		blastGain.gain.setValueAtTime(0, audioContext.currentTime);
		blastGain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
		blastGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
		
		blast.start(audioContext.currentTime);
		blast.stop(audioContext.currentTime + 0.6);
	}, 1800);
}

function generateAmbientSpace() {
	if (!audioContext || !ambientEnabled) return;
	
	// Deep space hum with modulation
	const hum = audioContext.createOscillator();
	const humGain = audioContext.createGain();
	const humFilter = audioContext.createBiquadFilter();
	const humMod = audioContext.createOscillator();
	const humModGain = audioContext.createGain();
	
	humMod.connect(humModGain);
	humModGain.connect(hum.frequency);
	hum.connect(humFilter);
	humFilter.connect(humGain);
	humGain.connect(audioContext.destination);
	
	hum.type = 'sine';
	hum.frequency.setValueAtTime(50, audioContext.currentTime);
	humMod.type = 'sine';
	humMod.frequency.setValueAtTime(0.1, audioContext.currentTime);
	humModGain.gain.setValueAtTime(5, audioContext.currentTime);
	
	humFilter.type = 'lowpass';
	humFilter.frequency.setValueAtTime(200, audioContext.currentTime);
	
	humGain.gain.setValueAtTime(0, audioContext.currentTime);
	humGain.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 2);
	humGain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 12);
	
	hum.start(audioContext.currentTime);
	humMod.start(audioContext.currentTime);
	hum.stop(audioContext.currentTime + 15);
	humMod.stop(audioContext.currentTime + 15);
	
	// Cosmic wind with multiple layers
	setTimeout(() => {
		// Main wind
		const wind1 = audioContext.createOscillator();
		const wind1Gain = audioContext.createGain();
		const wind1Filter = audioContext.createBiquadFilter();
		
		wind1.connect(wind1Filter);
		wind1Filter.connect(wind1Gain);
		wind1Gain.connect(audioContext.destination);
		
		wind1.type = 'sawtooth';
		wind1.frequency.setValueAtTime(100, audioContext.currentTime);
		wind1.frequency.setValueAtTime(150, audioContext.currentTime + 4);
		wind1.frequency.setValueAtTime(100, audioContext.currentTime + 8);
		
		wind1Filter.type = 'highpass';
		wind1Filter.frequency.setValueAtTime(80, audioContext.currentTime);
		
		wind1Gain.gain.setValueAtTime(0, audioContext.currentTime);
		wind1Gain.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 2);
		wind1Gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 12);
		
		wind1.start(audioContext.currentTime);
		wind1.stop(audioContext.currentTime + 15);
		
		// Secondary wind (higher frequency)
		const wind2 = audioContext.createOscillator();
		const wind2Gain = audioContext.createGain();
		const wind2Filter = audioContext.createBiquadFilter();
		
		wind2.connect(wind2Filter);
		wind2Filter.connect(wind2Gain);
		wind2Gain.connect(audioContext.destination);
		
		wind2.type = 'triangle';
		wind2.frequency.setValueAtTime(200, audioContext.currentTime);
		wind2.frequency.setValueAtTime(300, audioContext.currentTime + 3);
		wind2.frequency.setValueAtTime(200, audioContext.currentTime + 6);
		
		wind2Filter.type = 'bandpass';
		wind2Filter.frequency.setValueAtTime(250, audioContext.currentTime);
		wind2Filter.Q.setValueAtTime(2, audioContext.currentTime);
		
		wind2Gain.gain.setValueAtTime(0, audioContext.currentTime);
		wind2Gain.gain.linearRampToValueAtTime(0.02, audioContext.currentTime + 2);
		wind2Gain.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 12);
		
		wind2.start(audioContext.currentTime);
		wind2.stop(audioContext.currentTime + 15);
	}, 3000);
	
	// Distant cosmic echoes
	setTimeout(() => {
		for (let i = 0; i < 3; i++) {
			setTimeout(() => {
				const echo = audioContext.createOscillator();
				const echoGain = audioContext.createGain();
				const echoFilter = audioContext.createBiquadFilter();
				
				echo.connect(echoFilter);
				echoFilter.connect(echoGain);
				echoGain.connect(audioContext.destination);
				
				echo.type = 'sine';
				echo.frequency.setValueAtTime(80 + Math.random() * 40, audioContext.currentTime);
				echo.frequency.setValueAtTime(60 + Math.random() * 30, audioContext.currentTime + 2);
				
				echoFilter.type = 'lowpass';
				echoFilter.frequency.setValueAtTime(120, audioContext.currentTime);
				
				echoGain.gain.setValueAtTime(0, audioContext.currentTime);
				echoGain.gain.linearRampToValueAtTime(0.015, audioContext.currentTime + 1);
				echoGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 4);
				
				echo.start(audioContext.currentTime);
				echo.stop(audioContext.currentTime + 5);
			}, i * 4000);
		}
	}, 5000);
}

// Audio Controls
function setupAudioControls() {
	const toggleAudio = document.getElementById('toggleAudio');
	const toggleAmbient = document.getElementById('toggleAmbient');
	
	toggleAudio.addEventListener('click', function() {
		audioEnabled = !audioEnabled;
		this.textContent = audioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF';
		this.classList.toggle('active', !audioEnabled);
	});
	
	toggleAmbient.addEventListener('click', function() {
		ambientEnabled = !ambientEnabled;
		this.textContent = ambientEnabled ? '🌌 Ambient ON' : '🌌 Ambient OFF';
		this.classList.toggle('active', ambientEnabled);
		
		if (ambientEnabled) {
			generateAmbientSpace();
		}
	});
}

// Cursor Trail Effect
function setupCursorTrail() {
	const cursor = document.getElementById('cursor-trail');
	if (!cursor) return;
	
	// Check if device is mobile/touch
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window;
	
	if (isMobile) {
		// Hide cursor on mobile devices
		cursor.style.display = 'none';
		return;
	}
	
	document.addEventListener('mousemove', function(e) {
		// Store mouse position globally for other functions to use
		window.lastMousePos = { x: e.clientX, y: e.clientY };
		cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
	});
}

// Particle Effects
function setupParticleEffects() {
	const container = document.getElementById('particle-container');
	if (!container) return;
	setInterval(() => createFloatingParticle(container), 1200);
}

function createFloatingParticle(container) {
	const particle = document.createElement('div');
	particle.className = 'particle';
	particle.style.left = Math.random() * 100 + '%';
	particle.style.top = '100%';
	container.appendChild(particle);
	setTimeout(() => container.removeChild(particle), 4000);
}

function createTaskCompletionParticles(x, y) {
	const container = document.getElementById('particle-container');
	if (!container) return;
	for (let i = 0; i < 12; i++) {
		const p = document.createElement('div');
		p.className = 'particle';
		p.style.left = x + 'px';
		p.style.top = y + 'px';
		p.style.animationDuration = (2 + Math.random() * 1.5) + 's';
		container.appendChild(p);
		setTimeout(() => container.removeChild(p), 3500);
	}
}

// Drag and Drop Functionality
function setupDragAndDrop() {
	const tasks = document.querySelectorAll('.task');
	const checklist = document.getElementById('draggable-checklist');
	let dragSrcEl = null;
	
	tasks.forEach(task => {
		task.addEventListener('dragstart', handleDragStart);
		task.addEventListener('dragend', handleDragEnd);
	});
	checklist.addEventListener('dragover', handleDragOver);
	checklist.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
	this.classList.add('dragging');
	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.setData('text/plain', this.dataset.task);
}

function handleDragEnd() {
	this.classList.remove('dragging');
	saveTaskOrder();
}

function handleDragOver(e) {
	e.preventDefault();
	const dragging = document.querySelector('.task.dragging');
	const afterElement = getDragAfterElement(this, e.clientY);
	if (!afterElement) {
		this.appendChild(dragging);
	} else {
		this.insertBefore(dragging, afterElement);
	}
}

function handleDrop(e) {
	e.preventDefault();
}

function getDragAfterElement(container, y) {
	const elements = [...container.querySelectorAll('.task:not(.dragging)')];
	return elements.reduce((closest, child) => {
		const box = child.getBoundingClientRect();
		const offset = y - box.top - box.height / 2;
		if (offset < 0 && offset > closest.offset) {
			return { offset, element: child };
		} else {
			return closest;
		}
	}, { offset: Number.NEGATIVE_INFINITY }).element;
}

function saveTaskOrder() {
	const checklist = document.getElementById('draggable-checklist');
	const order = [...checklist.children].map(el => el.dataset.task);
	localStorage.setItem('task_order', JSON.stringify(order));
}

// Toggle task completion
function toggleTask(event) {
	const task = event.currentTarget;
	const taskId = task.dataset.task;
	const isCompleted = task.classList.contains('completed');
	
	const debugInfo = `🔄 ToggleTask: ${taskId} (${isCompleted ? 'completed' : 'incomplete'}) - ${event.type}`;
	console.log(debugInfo);
	if (window.updateDebugPanel) {
		window.updateDebugPanel(debugInfo);
	}
	
	// Check if device is mobile/touch
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window;
	
	// Add visual feedback for mobile
	if (isMobile) {
		task.style.transform = 'scale(0.95)';
		setTimeout(() => {
			task.style.transform = 'scale(1)';
		}, 150);
	}
	
	if (isCompleted) {
		console.log('❌ Uncompleting task:', taskId);
		task.classList.remove('completed');
		localStorage.setItem(`task_${taskId}`, 'false');
		removeTimestamp(taskId);
	} else {
		console.log('✅ Completing task:', taskId);
		task.classList.add('completed');
		localStorage.setItem(`task_${taskId}`, 'true');
		addTimestamp(taskId);
		if (audioEnabled) {
			generateRocketSound();
			generateMissionControlBeep();
		}
		createFlyingRockets();
		createTaskCompletionParticles(event.clientX, event.clientY);
		celebrateCompletion();
		updateStreak();
		
		// Check if all tasks are completed
		checkAllTasksCompleted();
	}
	
	// Force save the state immediately
	const finalState = task.classList.contains('completed');
	localStorage.setItem(`task_${taskId}`, finalState.toString());
	
	console.log('💾 Task state saved:', { taskId, finalState });
	
	updateProgress();
}

// Sound Functions
function playRocketSound() {
	generateRocketSound();
}

function playMissionControl() {
	generateMissionControlBeep();
}

function playCelebrationMusic() {
	generateCelebrationMusic();
}

// Timestamp Functions
function addTimestamp(taskId) {
	const task = document.querySelector(`[data-task="${taskId}"]`);
	const timestampDiv = task.querySelector('.task-timestamp');
	const now = new Date();
	const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	timestampDiv.textContent = `Completed at ${timeString}`;
}

function removeTimestamp(taskId) {
	const task = document.querySelector(`[data-task="${taskId}"]`);
	const timestampDiv = task.querySelector('.task-timestamp');
	timestampDiv.textContent = '';
}

// Streak Management
function loadStreak() {
	const lastCompletedDate = localStorage.getItem('lastCompletedDate');
	const today = new Date().toDateString();
	if (lastCompletedDate === today) {
		return;
	}
	if (lastCompletedDate) {
		const lastDate = new Date(lastCompletedDate);
		const daysDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
		if (daysDiff === 1) {
			currentStreak = parseInt(localStorage.getItem('currentStreak') || '0') + 1;
		} else if (daysDiff > 1) {
			currentStreak = 0;
		}
	}
	localStorage.setItem('currentStreak', currentStreak.toString());
	updateStreakDisplay();
}

function updateStreak() {
	const today = new Date().toDateString();
	const lastCompletedDate = localStorage.getItem('lastCompletedDate');
	if (lastCompletedDate !== today) {
		currentStreak = parseInt(localStorage.getItem('currentStreak') || '0') + 1;
		localStorage.setItem('currentStreak', currentStreak.toString());
	}
	localStorage.setItem('lastCompletedDate', today);
	updateStreakDisplay();
}

function updateStreakDisplay() {
	const el = document.getElementById('current-streak');
	if (el) {
		el.textContent = String(parseInt(localStorage.getItem('currentStreak') || '0'));
	}
}

// Load saved checklist state from localStorage
function loadChecklistState() {
	console.log('📂 Loading checklist state from localStorage...');
	const tasks = document.querySelectorAll('.task');
	tasks.forEach(task => {
		const taskId = task.dataset.task;
		const isCompleted = localStorage.getItem(`task_${taskId}`) === 'true';
		
		console.log('📋 Task state:', { taskId, isCompleted });
		
		if (isCompleted) {
			task.classList.add('completed');
			addTimestamp(taskId);
			console.log('✅ Restored completed task:', taskId);
		}
	});
	
	// Load saved task order
	const savedOrder = localStorage.getItem('task_order');
	if (savedOrder) {
		const order = JSON.parse(savedOrder);
		const checklist = document.getElementById('draggable-checklist');
		const tasks = Array.from(checklist.children);
		
		order.forEach(taskId => {
			const task = tasks.find(t => t.dataset.task === taskId);
			if (task) {
				checklist.appendChild(task);
			}
		});
	}
	
	console.log('📂 Checklist state loading complete');
}

// Update progress bar and counter
function updateProgress() {
	const tasks = document.querySelectorAll('.task');
	const completed = document.querySelectorAll('.task.completed');
	const fill = document.querySelector('.progress-fill');
	const text = document.querySelector('.progress-text .completed-count');
	if (fill) fill.style.width = `${(completed.length / tasks.length) * 100}%`;
	if (text) text.textContent = String(completed.length);
	localStorage.setItem('progress', JSON.stringify({ completed: completed.length }));
	
	// Save user-specific progress if logged in
	if (currentISRUUser) {
		saveUserProgress();
	}
	
	if (completed.length === tasks.length) {
		generateCelebrationMusic();
	}
}

// Reset all tasks
function resetChecklist() {
	console.log('🔄 resetChecklist() called - this might be the issue!');
	console.trace('Stack trace for resetChecklist call');
	
	const tasks = document.querySelectorAll('.task');
	tasks.forEach(task => {
		task.classList.remove('completed');
		localStorage.setItem(`task_${task.dataset.task}`, 'false');
		removeTimestamp(task.dataset.task);
	});
	updateProgress();
	
	// Add reset animation
	const resetButton = document.querySelector('.reset-button');
	if (resetButton) {
		resetButton.style.transform = 'scale(0.95)';
		setTimeout(() => {
			resetButton.style.transform = 'scale(1)';
		}, 150);
	}
}

// Flying rocket animation
function createFlyingRockets() {
	for (let i = 0; i < 5; i++) {
		const rocket = document.createElement('div');
		rocket.className = 'rocket';
		rocket.style.position = 'fixed';
		rocket.style.left = Math.random() * 100 + 'vw';
		rocket.style.top = '100vh';
		rocket.style.width = '36px';
		rocket.style.height = '36px';
		rocket.style.backgroundImage = "url('rocket.svg')";
		rocket.style.backgroundSize = 'contain';
		rocket.style.backgroundRepeat = 'no-repeat';
		rocket.style.backgroundPosition = 'center';
		rocket.style.zIndex = '1000';
		rocket.style.filter = 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 6px rgba(227, 24, 55, 0.4))';
		document.body.appendChild(rocket);
		const duration = 2000 + Math.random() * 1500;
		rocket.animate([
			{ transform: 'translateY(0) rotate(0deg)' },
			{ transform: 'translateY(-120vh) rotate(-15deg)' }
		], {
			duration,
			easing: 'ease-out',
			fill: 'forwards'
		});
		setTimeout(() => rocket.remove(), duration);
	}
}

// Celebrate individual task completion
function celebrateCompletion() {
	const allTasks = document.querySelectorAll('.task');
	const completed = document.querySelectorAll('.task.completed');
	if (allTasks.length && completed.length === allTasks.length) {
		generateCelebrationMusic();
	}
}

// Celebrate all tasks completed
function celebrateAllCompleted() {
	// Play celebration music
	if (audioEnabled) {
		generateCelebrationMusic();
	}
	
	// Create a massive rocket celebration
	setTimeout(() => {
		createRocketParticles(15); // Many more particles
		createFlyingRockets(8); // More flying rockets
	}, 500);
	
	// Add a special mission complete message
	showMissionCompleteMessage();
}

// Create floating rocket particles
function createRocketParticles(count = 5) {
	for (let i = 0; i < count; i++) {
		setTimeout(() => {
			const particle = document.createElement('div');
			particle.innerHTML = '🚀';
			particle.style.position = 'fixed';
			particle.style.fontSize = '1.5rem';
			particle.style.pointerEvents = 'none';
			particle.style.zIndex = '1000';
			particle.style.transition = 'all 2s ease-out';
			
			// Random starting position
			const startX = Math.random() * window.innerWidth;
			const startY = window.innerHeight + 50;
			particle.style.left = `${startX}px`;
			particle.style.top = `${startY}px`;
			
			document.body.appendChild(particle);
			
			// Animate the particle
			setTimeout(() => {
				particle.style.transform = `translateY(-${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`;
				particle.style.opacity = '0';
			}, 50);
			
			// Remove particle after animation
			setTimeout(() => {
				if (particle.parentNode) {
					particle.parentNode.removeChild(particle);
				}
			}, 2000);
		}, i * 150);
	}
}

// Show mission complete message
function showMissionCompleteMessage() {
	const message = document.createElement('div');
	message.innerHTML = `
		<div style="
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: rgba(0, 0, 0, 0.95);
			color: white;
			padding: 2rem;
			border-radius: 15px;
			text-align: center;
			z-index: 1001;
			font-family: 'Inter', sans-serif;
			font-size: 1.5rem;
			font-weight: bold;
			box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
			border: 2px solid #ffffff;
		">
			🎉 MISSION ACCOMPLISHED! 🎉<br>
			<span style="font-size: 1rem; opacity: 0.9;">All tasks completed for today!</span><br>
			<span style="font-size: 0.8rem; opacity: 0.7;">Ready for tomorrow's mission...</span>
		</div>
	`;
	
	document.body.appendChild(message);
	
	// Remove message after 4 seconds
	setTimeout(() => {
		if (message.parentNode) {
			message.parentNode.removeChild(message);
		}
	}, 4000);
}

// Share progress as visual card
function shareProgress() {
	// Create progress card
	const card = createProgressCard();
	
	// Add card to page
	document.body.appendChild(card);
	
	// Show sharing options
	showSharingOptions(card);
}

// Create visual progress card
function createProgressCard() {
	const card = document.createElement('div');
	card.className = 'progress-card';
	card.style.cssText = `
		position: fixed;
		top: 5%;
		left: 50%;
		transform: translateX(-50%);
		background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
		border: 3px solid #e31837;
		border-radius: 25px;
		padding: 2rem;
		text-align: center;
		max-width: 600px;
		width: 90%;
		height: auto;
		overflow: visible;
		z-index: 10002;
		box-shadow: 0 20px 40px rgba(0,0,0,0.8);
		color: white;
		font-family: 'Inter', sans-serif;
		cursor: none;
	`;
	
	// Remove the old squiggly border and use the same border style as mission complete
	// (The border is now handled by the main card style above)

	// Add ISRU branding with logo image
	const header = document.createElement('div');
	header.style.cssText = `
		text-align: center;
		margin-bottom: 20px;
		padding-bottom: 20px;
	`;
	
	const logoContainer = document.createElement('div');
	logoContainer.style.cssText = `
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 15px;
	`;
	
	const logoImg = document.createElement('img');
	logoImg.src = '../isru images/isru-logo-removebg-preview.png';
	logoImg.style.cssText = `
		height: 60px;
		width: auto;
		object-fit: contain;
		filter: drop-shadow(0 0 8px rgba(227, 24, 55, 0.3));
	`;
	logoImg.alt = 'ISRU Logo';
	
	// Fallback to text if image fails to load
	logoImg.onerror = () => {
		const fallbackLogo = document.createElement('div');
		fallbackLogo.style.cssText = `
			font-size: 48px;
			font-weight: bold;
			color: #e31837;
			text-shadow: 0 0 8px rgba(227, 24, 55, 0.3);
		`;
		fallbackLogo.textContent = 'ISRU';
		logoContainer.innerHTML = '';
		logoContainer.appendChild(fallbackLogo);
	};
	
	const subtitle = document.createElement('div');
	subtitle.style.cssText = `
		font-size: 14px;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 2px;
		margin-top: 10px;
	`;
	subtitle.textContent = 'Daily Checklist';
	
	logoContainer.appendChild(logoImg);
	header.appendChild(logoContainer);
	header.appendChild(subtitle);
	card.appendChild(header);

	// Add date
	const date = document.createElement('div');
	date.style.cssText = `
		text-align: center;
		font-size: 18px;
		color: #ffd700;
		margin-bottom: 30px;
		font-weight: bold;
	`;
	date.textContent = new Date().toLocaleDateString('en-US', { 
		weekday: 'long', 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric' 
	});
	card.appendChild(date);

	// Get tasks for the list
	const tasks = document.querySelectorAll('.task');

	// Add task breakdown with images
	const taskList = document.createElement('div');
	taskList.style.cssText = `
		display: flex;
		flex-direction: column;
		gap: 8px;
	`;
	
	// Task image mapping
	const taskImages = {
		'ten-free-throws': 'isru%20images/Screenshot_2025-08-18_at_2.01.58_PM-removebg-preview.png',
		'output-before-input': 'isru%20images/output.png',
		'out-and-back': 'isru%20images/Screenshot_2025-08-18_at_2.03.40_PM-removebg-preview.png',
		'wall-drawing': 'isru%20images/Screenshot_2025-08-18_at_2.03.59_PM-removebg-preview.png',
		'read-before-bed': 'isru%20images/book.png'
	};
	
	tasks.forEach((task, index) => {
		const taskItem = document.createElement('div');
		taskItem.style.cssText = `
			display: flex;
			align-items: center;
			padding: 8px 0;
			border-bottom: 1px solid #333;
		`;
		
		const taskIcon = document.createElement('div');
		taskIcon.style.cssText = `
			width: 40px;
			height: 40px;
			margin-right: 15px;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		`;
		
		// Add task image
		const taskImg = document.createElement('img');
		const taskId = task.dataset.task;
		taskImg.src = taskImages[taskId] || '../isru images/walldrawing.png';
		taskImg.style.cssText = `
			width: 100%;
			height: 100%;
			object-fit: contain;
			filter: ${task.classList.contains('completed') ? 'brightness(1.2) saturate(1.2)' : 'brightness(0.6) saturate(0.8)'};
			transition: all 0.3s ease;
		`;
		taskImg.alt = task.querySelector('h3').textContent;
		
		// Add simple completion mark
		const completionMark = document.createElement('div');
		completionMark.style.cssText = `
			width: 24px;
			height: 24px;
			margin-left: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 18px;
			font-weight: bold;
			color: ${task.classList.contains('completed') ? '#00ff00' : '#ff0000'};
			text-shadow: 0 0 8px ${task.classList.contains('completed') ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'};
		`;
		completionMark.textContent = task.classList.contains('completed') ? '✓' : '✗';
		
		taskIcon.appendChild(taskImg);
		taskItem.appendChild(completionMark);
		
		const taskName = document.createElement('div');
		taskName.style.cssText = `
			flex: 1;
			font-size: 14px;
			color: ${task.classList.contains('completed') ? '#fff' : '#888'};
		`;
		taskName.textContent = task.querySelector('h3').textContent;
		
		taskItem.appendChild(taskIcon);
		taskItem.appendChild(taskName);
		taskList.appendChild(taskItem);
	});
	
	card.appendChild(taskList);
	
	// Add streak info at the bottom
	const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
	if (currentStreak > 0) {
		const streak = document.createElement('div');
		streak.style.cssText = `
			text-align: center;
			margin-top: 20px;
			padding: 10px;
			background: rgba(227, 24, 55, 0.05);
			border-radius: 8px;
			border: 1px solid rgba(227, 24, 55, 0.3);
		`;
		
		const streakIcon = document.createElement('div');
		streakIcon.style.cssText = `
			font-size: 16px;
			margin-bottom: 5px;
		`;
		streakIcon.textContent = '🔥';
		
		const streakText = document.createElement('div');
		streakText.style.cssText = `
			font-size: 12px;
			color: #ffd700;
			font-weight: bold;
		`;
		streakText.textContent = `${currentStreak} Day Streak!`;
		
		streak.appendChild(streakIcon);
		streak.appendChild(streakText);
		card.appendChild(streak);
	}

	// Add close button
	const closeBtn = document.createElement('button');
	closeBtn.textContent = '×';
	closeBtn.style.cssText = `
		position: absolute;
		top: 15px;
		right: 15px;
		background: none;
		border: none;
		color: #888;
		font-size: 24px;
		cursor: pointer;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	`;
	closeBtn.onmouseover = () => {
		closeBtn.style.background = '#e31837';
		closeBtn.style.color = 'white';
	};
	closeBtn.onmouseout = () => {
		closeBtn.style.background = 'none';
		closeBtn.style.color = '#888';
	};
	closeBtn.onclick = () => {
		card.dispatchEvent(new CustomEvent('progress-card:close', { bubbles: true }));
		if (card.parentNode) card.parentNode.removeChild(card);
	};
	
	card.appendChild(closeBtn);

	return card;
}

// Show sharing options
function showSharingOptions(card) {
	const sharingOptions = document.createElement('div');
	sharingOptions.className = 'sharing-options';
	sharingOptions.style.cssText = `
		position: fixed;
		top: 65%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.9);
		border: 2px solid #e31837;
		border-radius: 20px;
		padding: 2rem;
		text-align: center;
		z-index: 10003;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 300px;
		backdrop-filter: blur(10px);
	`;

	// X (Twitter) button
	const xBtn = document.createElement('button');
	xBtn.style.cssText = `
		padding: 12px 20px;
		background: #e31837;
		color: white;
		border: none;
		border-radius: 25px;
		font-size: 18px;
		font-weight: bold;
		cursor: none;
		box-shadow: 0 4px 12px rgba(0,0,0,0.3);
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	`;
	xBtn.textContent = '𝕏';
	
	xBtn.onmouseover = () => {
		xBtn.style.transform = 'translateY(-2px)';
		xBtn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
	};
	xBtn.onmouseout = () => {
		xBtn.style.transform = 'translateY(0)';
		xBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
	};
	
	// Test basic functionality first
	xBtn.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		console.log('X button clicked!');
		shareToX();
	});

	// Remove Instagram button completely - just keep Twitter
	sharingOptions.appendChild(xBtn);
	
	// Position the sharing options below the progress card
	const cardRect = card.getBoundingClientRect();
	sharingOptions.style.top = `${cardRect.bottom + 20}px`;
	sharingOptions.style.left = '50%';
	sharingOptions.style.transform = 'translateX(-50%)';
	
	document.body.appendChild(sharingOptions);

	// Create a backdrop to capture outside clicks
	const backdrop = document.createElement('div');
	backdrop.style.cssText = `
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.4);
		z-index: 10001;
	`;
	document.body.appendChild(backdrop);

	const cleanup = () => {
		if (sharingOptions.parentNode) sharingOptions.remove();
		if (backdrop.parentNode) backdrop.remove();
	};

	// Close on custom close event from card
	card.addEventListener('progress-card:close', cleanup);

	// Close when clicking backdrop
	backdrop.addEventListener('click', () => {
		card.dispatchEvent(new CustomEvent('progress-card:close', { bubbles: true }));
		if (card.parentNode) card.remove();
	});

	// Close on Escape key
	const onKey = (e) => {
		if (e.key === 'Escape') {
			card.dispatchEvent(new CustomEvent('progress-card:close', { bubbles: true }));
			if (card.parentNode) card.remove();
			window.removeEventListener('keydown', onKey);
		}
	};
	window.addEventListener('keydown', onKey);

	// Fallback: cleanup if card is removed by any other means
	const observer = new MutationObserver(() => {
		if (!document.body.contains(card)) {
			cleanup();
			observer.disconnect();
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });
}

// Create sharing button
function createSharingButton(text, color, onClick) {
	const btn = document.createElement('button');
	btn.textContent = text;
	btn.style.cssText = `
		padding: 12px 20px;
		background: ${color};
		color: white;
		border: none;
		border-radius: 25px;
		font-size: 14px;
		font-weight: bold;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0,0,0,0.3);
		background: ${color};
		color: white;
		border: none;
		border-radius: 25px;
		font-size: 14px;
		font-weight: bold;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0,0,0,0.3);
		transition: all 0.2s;
	`;
	btn.onmouseover = () => {
		btn.style.transform = 'translateY(-2px)';
		btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
	};
	btn.onmouseout = () => {
		btn.style.transform = 'translateY(0)';
		btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
	};
	btn.onclick = onClick;
	return btn;
}

// Copy progress to clipboard
function copyProgressToClipboard() {
	const tasks = document.querySelectorAll('.task');
	const completed = document.querySelectorAll('.task.completed');
	const progressPercent = Math.round((completed.length / tasks.length) * 100);
	const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
	
	let progressText = `🚀 ISRU Daily Checklist Progress 🚀\n\n`;
	progressText += `📅 ${new Date().toLocaleDateString()}\n`;
	progressText += `✅ ${completed.length}/${tasks.length} tasks completed (${progressPercent}%)\n`;
	
	if (currentStreak > 0) {
		progressText += `🔥 ${currentStreak} day streak!\n\n`;
	}
	
	progressText += `📋 Task Breakdown:\n`;
	tasks.forEach((task, index) => {
		const taskName = task.querySelector('h3').textContent;
		const isCompleted = task.classList.contains('completed');
		const status = isCompleted ? '✅' : '○';
		progressText += `${status} ${taskName}\n`;
	});
	
	progressText += `\n#ISRU #DailyChecklist #Productivity`;
	
	navigator.clipboard.writeText(progressText).then(() => {
		showNotification('Progress copied to clipboard!', 'success');
	}).catch(() => {
		showNotification('Failed to copy to clipboard', 'error');
	});
}

// Native sharing (if supported)
function shareProgressNative() {
	const tasks = document.querySelectorAll('.task');
	const completed = document.querySelectorAll('.task.completed');
	const progressPercent = Math.round((completed.length / tasks.length) * 100);
	
	const shareData = {
		title: 'ISRU Daily Checklist Progress',
		text: `Completed ${completed.length}/${tasks.length} tasks (${progressPercent}%) today! 🚀`,
		url: window.location.href
	};
	
	navigator.share(shareData).then(() => {
		showNotification('Progress shared successfully!', 'success');
	});
}

// Share to X (Twitter)
function shareToX() {
	try {
		console.log('shareToX function called');
		
		const tasks = document.querySelectorAll('.task');
		const completed = document.querySelectorAll('.task.completed');
		const progressPercent = Math.round((completed.length / tasks.length) * 100);
		const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
		
		let tweetText = `🚀 ISRU Daily Checklist Progress 🚀\n\n`;
		tweetText += `✅ ${completed.length}/${tasks.length} tasks completed (${progressPercent}%)\n`;
		
		if (currentStreak > 0) {
			tweetText += `🔥 ${currentStreak} day streak!\n`;
		}
		
		tweetText += `\n#ISRU #DailyChecklist #Productivity`;
		
		// Simple approach - just open Twitter with text
		const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
		window.open(tweetUrl, '_blank');
		
	} catch (error) {
		console.error('Error in shareToX:', error);
		// Simple fallback
		const tweetText = `🚀 ISRU Daily Checklist Progress 🚀\n\n#ISRU #DailyChecklist #Productivity`;
		const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
		window.open(tweetUrl, '_blank');
	}
}

// Share to Instagram
function shareToInstagram() {
	try {
		console.log('shareToInstagram function called');
		
		// Check if we're on mobile
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window;
		
		if (isMobile) {
			// On mobile, open Instagram app directly to story creation
			openInstagramAppToStories();
		} else {
			// On desktop, open Instagram web
			window.open('https://www.instagram.com/stories/create/', '_blank');
		}
		
	} catch (error) {
		console.error('Error in shareToInstagram:', error);
		// Fallback to web
		window.open('https://www.instagram.com/stories/create/', '_blank');
	}
}

// Open Instagram app directly to stories on mobile
function openInstagramAppToStories() {
	// Try multiple Instagram app deep links
	const instagramUrls = [
		// iOS Instagram app - Story camera
		'instagram-stories://share',
		// iOS Instagram app - Camera
		'instagram://camera',
		// iOS Instagram app - Stories
		'instagram://story-camera',
		// Android Instagram app - Stories
		'intent://instagram.com/stories/create#Intent;package=com.instagram.android;scheme=https;end',
		// Android Instagram app - Camera
		'intent://instagram.com/camera#Intent;package=com.instagram.android;scheme=https;end'
	];
	
	// Try each URL until one works
	let currentIndex = 0;
	
	function tryNextUrl() {
		if (currentIndex >= instagramUrls.length) {
			// All URLs failed, fallback to web
			console.log('All Instagram app URLs failed, falling back to web');
			window.open('https://www.instagram.com/stories/create/', '_blank');
			return;
		}
		
		const url = instagramUrls[currentIndex];
		console.log(`Trying Instagram URL ${currentIndex + 1}:`, url);
		
		// Try to open the app
		const link = document.createElement('a');
		link.href = url;
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		// Check if app opened after a short delay
		setTimeout(() => {
			// If we're still on the same page, try the next URL
			currentIndex++;
			tryNextUrl();
		}, 300);
	}
	
	// Start trying URLs
	tryNextUrl();
}

// Open Instagram web (fallback for desktop or when app doesn't open)
function openInstagramWeb() {
	// Try to open Instagram stories create page
	const instagramUrl = 'https://www.instagram.com/stories/create/';
	console.log('Opening Instagram web URL:', instagramUrl);
	window.open(instagramUrl, '_blank');
	
	showNotification('📸 Instagram opened! Navigate to Stories to post your screenshot 📸', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
	const notification = document.createElement('div');
	notification.className = `notification ${type}`;
	notification.textContent = message;
	notification.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		padding: 12px 20px;
		background: ${type === 'success' ? '#4caf50' : '#2196f3'};
		color: white;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.3);
		z-index: 10001;
		font-size: 14px;
		transform: translateX(100%);
		transition: transform 0.3s ease;
	`;
	
	document.body.appendChild(notification);
	
	// Animate in
	setTimeout(() => {
		notification.style.transform = 'translateX(0)';
	}, 100);
	
	// Remove after 3 seconds
	setTimeout(() => {
		notification.style.transform = 'translateX(100%)';
		setTimeout(() => notification.remove(), 300);
	}, 3000);
}

function exportReport() {
	const completedTasks = document.querySelectorAll('.task.completed');
	const totalTasks = document.querySelectorAll('.task');
	const streak = localStorage.getItem('currentStreak') || '0';
	const today = new Date().toLocaleDateString();
	
	let report = `ISRU Daily Mission Report - ${today}\n`;
	report += `Progress: ${completedTasks.length}/${totalTasks.length} tasks completed\n`;
	report += `Current Streak: ${streak} days\n\n`;
	report += `Completed Tasks:\n`;
	
	completedTasks.forEach(task => {
		const title = task.querySelector('h3').textContent;
		const timestamp = task.querySelector('.task-timestamp').textContent;
		report += `✅ ${title} - ${timestamp}\n`;
	});
	
	// Create downloadable file
	const blob = new Blob([report], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `isru-mission-report-${today}.txt`;
	a.click();
	URL.revokeObjectURL(url);
}

function printChecklist() {
	window.print();
}

// Enhanced keyboard shortcuts
function setupKeyboardShortcuts() {
	document.addEventListener('keydown', function(event) {
		// Don't trigger shortcuts when typing in input fields
		if (event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) return;
		
		// Spacebar or Enter: Complete first incomplete task
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			const firstIncomplete = document.querySelector('.task:not(.completed)');
			if (firstIncomplete) {
				firstIncomplete.click();
				showNotification('Task completed with keyboard shortcut! 🚀', 'success');
			}
		}
		
		// R: Reset checklist
		if (event.key.toLowerCase() === 'r') {
			event.preventDefault();
			resetChecklist();
			showNotification('Checklist reset with keyboard shortcut! 🔄', 'info');
		}
		
		// S: Share progress
		if (event.key.toLowerCase() === 's') {
			event.preventDefault();
			shareProgress();
			showNotification('Share progress opened with keyboard shortcut! 📤', 'info');
		}
		
		// 1-5: Complete specific tasks
		if (event.key >= '1' && event.key <= '5') {
			event.preventDefault();
			const taskIndex = parseInt(event.key) - 1;
			const tasks = document.querySelectorAll('.task');
			if (tasks[taskIndex]) {
				tasks[taskIndex].click();
				showNotification(`Task ${event.key} completed with keyboard shortcut! 🚀`, 'success');
			}
		}
	});
}

// Show keyboard shortcuts modal
function showKeyboardShortcuts() {
	const modal = document.createElement('div');
	modal.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		cursor: none;
	`;
	
	const content = document.createElement('div');
	content.style.cssText = `
		background: #1a1a1a;
		border: 2px solid #e31837;
		border-radius: 15px;
		padding: 2rem;
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		position: relative;
	`;
	
	content.innerHTML = `
		<h2 style="color: #e31837; margin-bottom: 1.5rem; text-align: center; font-size: 1.5rem;">⌨️ Keyboard Shortcuts</h2>
		<div style="display: grid; gap: 1rem;">
			<div style="display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
				<span><strong>Spacebar/Enter:</strong></span>
				<span>Complete first incomplete task</span>
			</div>
			<div style="display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
				<span><strong>1-5:</strong></span>
				<span>Complete specific task</span>
			</div>
			<div style="display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
				<span><strong>R:</strong></span>
				<span>Reset checklist</span>
			</div>
			<div style="display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
				<span><strong>S:</strong></span>
				<span>Share progress</span>
			</div>
			<div style="display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
				<span><strong>E:</strong></span>
				<span>Export report</span>
			</div>
			<div style="display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
				<span><strong>P:</strong></span>
				<span>Print checklist</span>
			</div>
			<div style="display: flex; justify-content: space-between; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
				<span><strong>H:</strong></span>
				<span>Show this help</span>
			</div>
		</div>
		<div style="text-align: center; margin-top: 1.5rem; color: #888; font-size: 0.9rem;">
			Press ESC or click outside to close
		</div>
	`;
	
	// Close button
	const closeBtn = document.createElement('button');
	closeBtn.innerHTML = '×';
	closeBtn.style.cssText = `
		position: absolute;
		top: 15px;
		right: 15px;
		background: none;
		border: none;
		color: #888;
		font-size: 24px;
		cursor: none;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s;
	`;
	
	closeBtn.onmouseover = () => {
		closeBtn.style.background = '#e31837';
		closeBtn.style.color = 'white';
	};
	closeBtn.onmouseout = () => {
		closeBtn.style.background = 'none';
		closeBtn.style.color = '#888';
	};
	
	// Close functionality
	const closeModal = () => {
		modal.remove();
	};
	
	closeBtn.onclick = closeModal;
	modal.onclick = (e) => {
		if (e.target === modal) closeModal();
	};
	
	// ESC key to close
	document.addEventListener('keydown', function escHandler(e) {
		if (e.key === 'Escape') {
			closeModal();
			document.removeEventListener('keydown', escHandler);
		}
	});
	
	content.appendChild(closeBtn);
	modal.appendChild(content);
	document.body.appendChild(modal);
}

// Add swipe support for mobile devices (separate from task touch handling)
let swipeStartY = 0;
let swipeEndY = 0;

document.addEventListener('touchstart', function(event) {
	swipeStartY = event.touches[0].clientY;
});

document.addEventListener('touchend', function(event) {
	swipeEndY = event.changedTouches[0].clientY;
	handleSwipe();
});

function handleSwipe() {
	const swipeThreshold = 50;
	const swipeDistance = swipeEndY - swipeStartY;
	if (swipeDistance < -swipeThreshold && window.innerWidth <= 768) {
		resetChecklist();
	}
} 

// Ambient stars
function initAmbientStars(count = 160) {
	const container = document.getElementById('ambient-stars');
	if (!container) return;
	container.innerHTML = '';
	const w = window.innerWidth;
	const h = window.innerHeight;
	for (let i = 0; i < count; i++) {
		const s = document.createElement('div');
		s.className = 'star';
		const size = 1 + Math.random() * 2;
		s.style.width = size + 'px';
		s.style.height = size + 'px';
		s.style.left = Math.random() * w + 'px';
		s.style.top = Math.random() * h + 'px';
		s.style.animationDelay = (Math.random() * 2) + 's';
		s.style.opacity = String(0.4 + Math.random() * 0.6);
		container.appendChild(s);
	}
}

// Parallax for ambient stars
function setupAmbientParallax() {
	const ambient = document.getElementById('ambient-stars');
	if (!ambient) return;
	document.addEventListener('mousemove', (e) => {
		const sx = (e.clientX / window.innerWidth - 0.5) * 12;
		const sy = (e.clientY / window.innerHeight - 0.5) * 12;
		ambient.style.transform = `translate(${sx}px, ${sy}px)`;
	});
	window.addEventListener('resize', () => initAmbientStars());
}

// Check if all tasks are completed and show celebration
function checkAllTasksCompleted() {
	const tasks = document.querySelectorAll('.task');
	const completedTasks = document.querySelectorAll('.task.completed');
	
	if (completedTasks.length === tasks.length && tasks.length > 0) {
		// All tasks completed! Show celebration
		setTimeout(() => {
			showCelebrationPopup();
		}, 1000); // Wait 1 second after last task completion
	}
}

// Show big celebration popup
function showCelebrationPopup() {
	// Create celebration container
	const celebration = document.createElement('div');
	celebration.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 20000;
		cursor: none;
	`;
	
	// Ensure rocket cursor works on celebration screen (desktop only)
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window;
	
	if (!isMobile) {
		celebration.addEventListener('mouseenter', () => {
			document.body.style.cursor = 'none';
			// Show the rocket cursor
			const cursorTrail = document.getElementById('cursor-trail');
			if (cursorTrail) {
				cursorTrail.style.display = 'block';
			}
		});
		
		celebration.addEventListener('mouseleave', () => {
			document.body.style.cursor = 'none';
			// Keep rocket cursor visible
			const cursorTrail = document.getElementById('cursor-trail');
			if (cursorTrail) {
				cursorTrail.style.display = 'block';
			}
		});
	}
	
	// Create celebration content
	const content = document.createElement('div');
	content.style.cssText = `
		background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
		border: 3px solid #e31837;
		border-radius: 25px;
		padding: 2rem;
		text-align: center;
		max-width: 600px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		animation: celebrationEntrance 0.8s ease-out;
		cursor: none;
	`;
	
	content.innerHTML = `
		<div style="font-size: 6rem; margin-bottom: 1rem; display: flex; justify-content: center; align-items: center;">
			<div style="width: 6rem; height: 6rem; background-image: url('rocket.svg'); background-size: contain; background-repeat: no-repeat; background-position: center; filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8));"></div>
		</div>
		<h1 style="color: #e31837; font-size: 3rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px;">Mission Complete!</h1>
		<p style="color: #ffffff; font-size: 1.5rem; margin-bottom: 2rem;">All 5 tasks completed successfully!</p>
		<div style="color: #ffd700; font-size: 2rem; margin-bottom: 2rem;">🔥 ${localStorage.getItem('currentStreak') || '1'} Day Streak!</div>
		<p style="color: #888; font-size: 1.2rem; margin-bottom: 2rem;">Ready for tomorrow's mission?</p>
		<button id="celebration-close" style="
			background: #e31837;
			color: white;
			border: none;
			padding: 1rem 2rem;
			border-radius: 15px;
			font-size: 1.2rem;
			font-weight: bold;
			cursor: none;
			transition: all 0.3s ease;
			margin-bottom: 1rem;
		">Continue Mission</button>
	`;
	
	// Add celebration animations
	const confetti = document.createElement('div');
	confetti.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: hidden;
	`;
	
	// Create confetti pieces
	for (let i = 0; i < 100; i++) {
		const piece = document.createElement('div');
		piece.style.cssText = `
			position: absolute;
			width: 10px;
			height: 10px;
			background: ${['#e31837', '#ffd700', '#ffffff', '#00ff00', '#0080ff'][Math.floor(Math.random() * 5)]};
			left: ${Math.random() * 100}%;
			top: -10px;
			animation: confettiFall ${2 + Math.random() * 3}s linear infinite;
			animation-delay: ${Math.random() * 2}s;
		`;
		confetti.appendChild(piece);
	}
	
	content.appendChild(confetti);
	celebration.appendChild(content);
	document.body.appendChild(celebration);
	
	// Add celebration sound
	if (audioEnabled) {
		generateCelebrationMusic();
	}
	
	// Create flying rockets all over the screen
	createCelebrationRockets();
	
	// Ensure rocket cursor is visible and positioned (desktop only)
	if (!isMobile) {
		const cursorTrail = document.getElementById('cursor-trail');
		if (cursorTrail) {
			console.log('🎯 Setting up rocket cursor for celebration');
			cursorTrail.style.display = 'block';
			cursorTrail.style.zIndex = '20002'; // Above celebration content
			// Position cursor at current mouse position
			const currentMousePos = window.lastMousePos || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
			cursorTrail.style.transform = `translate3d(${currentMousePos.x}px, ${currentMousePos.y}px, 0) translate(-50%, -50%)`;
			console.log('🚀 Rocket cursor positioned at:', currentMousePos);
		} else {
			console.log('❌ Cursor trail element not found!');
		}
	}
	
	// Close button functionality
	const closeBtn = document.getElementById('celebration-close');
	closeBtn.onclick = () => {
		// Just close the celebration screen - don't reset tasks
		celebration.remove();
		
		// Show a message that tasks are ready to share
		showNotification('📤 Share your 5/5 progress to Twitter!', 'success');
	};
	
	// Close on outside click
	celebration.onclick = (e) => {
		if (e.target === celebration) {
			celebration.remove();
		}
	};
	
	// ESC key to close
	document.addEventListener('keydown', function escHandler(e) {
		if (e.key === 'Escape') {
			celebration.remove();
			document.removeEventListener('keydown', escHandler);
		}
	});
	
	// Ensure rocket cursor follows mouse on celebration screen (desktop only)
	if (!isMobile) {
		const celebrationMouseMove = (e) => {
			const cursorTrail = document.getElementById('cursor-trail');
			if (cursorTrail) {
				cursorTrail.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
				cursorTrail.style.display = 'block';
				console.log('🖱️ Moving rocket cursor to:', e.clientX, e.clientY);
			} else {
				console.log('❌ Cursor trail not found in mouse move!');
			}
		};
		
		document.addEventListener('mousemove', celebrationMouseMove);
		
		// Clean up event listener when celebration closes
		const cleanup = () => {
			document.removeEventListener('mousemove', celebrationMouseMove);
		};
		
		celebration.addEventListener('remove', cleanup);
	}
	
	// Auto-close after 10 seconds
	setTimeout(() => {
		if (celebration.parentNode) {
			celebration.remove();
		}
	}, 10000);
}

// Create tons of flying rockets for celebration
function createCelebrationRockets() {
	console.log('🎉 Creating celebration rockets!');
	const rocketCount = 25; // Create 25 rockets
	
	for (let i = 0; i < rocketCount; i++) {
		setTimeout(() => {
			console.log(`🚀 Creating rocket ${i + 1}/${rocketCount}`);
			createSingleCelebrationRocket();
		}, i * 200); // Stagger rocket creation
	}
}

// Create a single celebration rocket
function createSingleCelebrationRocket() {
	console.log('🎯 Creating single rocket...');
	const rocket = document.createElement('div');
	
	// Random size between 20px and 80px
	const size = 20 + Math.random() * 60;
	
	// Random starting position (off-screen)
	const startSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
	let startX, startY;
	
	switch (startSide) {
		case 0: // top
			startX = Math.random() * window.innerWidth;
			startY = -size;
			break;
		case 1: // right
			startX = window.innerWidth + size;
			startY = Math.random() * window.innerHeight;
			break;
		case 2: // bottom
			startX = Math.random() * window.innerWidth;
			startY = window.innerHeight + size;
			break;
		case 3: // left
			startX = -size;
			startY = Math.random() * window.innerHeight;
			break;
	}
	
	// Random end position (opposite side)
	const endX = Math.random() * window.innerWidth;
	const endY = Math.random() * window.innerHeight;
	
	// Calculate angle for rocket direction
	const angle = Math.atan2(endY - startY, endX - startX);
	const rotation = (angle * 180 / Math.PI) + 90; // +90 to align rocket properly
	
	// Random speed between 3-8 seconds
	const duration = 3 + Math.random() * 5;
	
	rocket.style.cssText = `
		position: fixed;
		left: ${startX}px;
		top: ${startY}px;
		width: ${size}px;
		height: ${size}px;
		z-index: 20001;
		pointer-events: none;
		transform: rotate(${rotation}deg);
	`;
	
	// Use JavaScript animation instead of CSS
	animateRocket(rocket, startX, startY, endX, endY, duration);
	
	// Use the exact same rocket.svg as the cursor
	rocket.style.backgroundImage = "url('rocket.svg')";
	rocket.style.backgroundSize = "contain";
	rocket.style.backgroundRepeat = "no-repeat";
	rocket.style.backgroundPosition = "center";
	rocket.style.filter = "drop-shadow(0 0 20px rgba(255, 255, 255, 1))";
	
	// Add rocket trail effect
	const trail = document.createElement('div');
	trail.style.cssText = `
		position: absolute;
		top: 50%;
		left: 50%;
		width: ${size * 2}px;
		height: ${size * 0.3}px;
		background: linear-gradient(90deg, transparent, #ffd700, #e31837);
		border-radius: 50%;
		transform: translate(-50%, -50%) rotate(${rotation + 90}deg);
		opacity: 0.7;
		filter: blur(2px);
	`;
	
	rocket.appendChild(trail);
	document.body.appendChild(rocket);
	
	// Remove rocket after animation
	setTimeout(() => {
		if (rocket.parentNode) {
			rocket.remove();
		}
	}, duration * 1000 + 1000);
}

// Animate rocket using JavaScript
function animateRocket(rocket, startX, startY, endX, endY, duration) {
	const startTime = performance.now();
	const totalDistanceX = endX - startX;
	const totalDistanceY = endY - startY;
	
	function animate(currentTime) {
		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / (duration * 1000), 1);
		
		// Easing function for smooth movement
		const easeProgress = 1 - Math.pow(1 - progress, 3);
		
		const currentX = startX + (totalDistanceX * easeProgress);
		const currentY = startY + (totalDistanceY * easeProgress);
		
		rocket.style.left = currentX + 'px';
		rocket.style.top = currentY + 'px';
		
		// Fade out near the end
		if (progress > 0.8) {
			rocket.style.opacity = 1 - ((progress - 0.8) / 0.2);
		}
		
		if (progress < 1) {
			requestAnimationFrame(animate);
		}
	}
	
	requestAnimationFrame(animate);
}

// Open Twitter app on mobile with pre-filled tweet
function openTwitterAppWithText(tweetText) {
	// Try multiple Twitter app URLs for different mobile platforms
	const twitterUrls = [
		// iOS Twitter app
		`twitter://post?message=${encodeURIComponent(tweetText)}`,
		// Android Twitter app
		`intent://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}#Intent;package=com.twitter.android;scheme=https;end`,
		// Fallback to web intent
		`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
	];
	
	// Try to open Twitter app first
	const twitterAppUrl = twitterUrls[0];
	console.log('Attempting to open Twitter app with URL:', twitterAppUrl);
	
	// Create a hidden iframe to test if the app opens
	const testFrame = document.createElement('iframe');
	testFrame.style.display = 'none';
	testFrame.src = twitterAppUrl;
	document.body.appendChild(testFrame);
	
	// Set a timeout to fallback to web intent if app doesn't open
	setTimeout(() => {
		// Remove test frame
		if (testFrame.parentNode) {
			testFrame.parentNode.removeChild(testFrame);
		}
		
		// Fallback to web intent
		console.log('Falling back to Twitter web intent');
		openTwitterWebIntent(tweetText);
	}, 1000);
}

// Open Twitter web intent (fallback for desktop or when app doesn't open)
function openTwitterWebIntent(tweetText) {
	const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
	console.log('Opening Twitter web intent:', tweetUrl);
	window.open(tweetUrl, '_blank');
}

// Setup mobile-specific optimizations
function setupMobileOptimizations() {
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window;
	
	if (isMobile) {
		console.log('📱 Mobile device detected - applying optimizations');
		
		// Prevent zoom on double-tap
		let lastTouchEnd = 0;
		document.addEventListener('touchend', function(event) {
			const now = (new Date()).getTime();
			if (now - lastTouchEnd <= 300) {
				event.preventDefault();
			}
			lastTouchEnd = now;
		}, false);
		
		// Simple touch handling - no complex scroll detection
		console.log('📱 Using simplified mobile touch handling');
		
		// Create visual debug panel for mobile
		function createMobileDebugPanel() {
			const debugPanel = document.createElement('div');
			debugPanel.id = 'mobile-debug-panel';
			debugPanel.style.cssText = `
				position: fixed;
				top: 10px;
				right: 10px;
				background: rgba(0, 0, 0, 0.8);
				color: white;
				padding: 10px;
				border-radius: 8px;
				font-family: monospace;
				font-size: 12px;
				max-width: 300px;
				z-index: 10000;
				border: 2px solid #e31837;
			`;
			
			debugPanel.innerHTML = `
				<div style="color: #e31837; font-weight: bold; margin-bottom: 5px;">📱 Mobile Debug</div>
				<div id="debug-content">Ready for testing...</div>
				<div style="margin-top: 5px; font-size: 10px; color: #888;">
					Tap tasks to see debug info
				</div>
			`;
			
			document.body.appendChild(debugPanel);
			
			// Update debug panel with task interactions
			window.updateDebugPanel = function(message) {
				const debugContent = document.getElementById('debug-content');
				if (debugContent) {
					const timestamp = new Date().toLocaleTimeString();
					debugContent.innerHTML = `${timestamp}: ${message}<br>${debugContent.innerHTML}`;
					
					// Keep only last 5 messages
					const lines = debugContent.innerHTML.split('<br>');
					if (lines.length > 6) {
						debugContent.innerHTML = lines.slice(0, 6).join('<br>');
					}
				}
			};
		}
		
		// Disable hover effects on mobile
		const style = document.createElement('style');
		style.textContent = `
			@media (max-width: 768px) {
				.task:hover {
					transform: none !important;
					box-shadow: none !important;
				}
			}
		`;
		document.head.appendChild(style);
		
		// Add mobile-specific CSS classes
		document.body.classList.add('mobile-device');
	}
}

// Enhanced task state preservation - with debugging
function preserveTaskStates() {
	console.log(' preserveTaskStates() called');
	const tasks = document.querySelectorAll('.task');
	tasks.forEach(task => {
		const taskId = task.dataset.task;
		const visualState = task.classList.contains('completed');
		const storedState = localStorage.getItem(`task_${taskId}`) === 'true';
		
		console.log(`🔍 Task ${taskId}:`, {
			visual: visualState,
			stored: storedState,
			match: visualState === storedState
		});
		
		// Only fix the state if there's a mismatch AND localStorage is wrong
		if (visualState !== storedState) {
			console.log(`🔄 Scroll: Fixing state mismatch for ${taskId}`, {
				visual: visualState,
				stored: storedState
			});
			
			// Update localStorage to match the visual state
			localStorage.setItem(`task_${taskId}`, visualState.toString());
		}
	});
}

// Simple scroll handler that doesn't interfere with tasks
window.addEventListener('scroll', function() {
	console.log('📱 Scroll event detected');
	// Just preserve task states after scrolling - no blocking
	setTimeout(preserveTaskStates, 100);
});

// Separate function for handling task taps (not scrolls)
function handleTaskTap(event) {
	event.preventDefault();
	event.stopPropagation();
	
	const task = event.currentTarget;
	const taskId = task.dataset.task;
	const isCompleted = task.classList.contains('completed');
	
	const message = ` Task tap: ${taskId} (${isCompleted ? 'completed' : 'incomplete'})`;
	console.log(message);
	if (window.updateDebugPanel) {
		window.updateDebugPanel(message);
	}
	
	toggleTask(event);
}

// Aggressive task state monitoring
function addTaskStateMonitoring() {
	console.log('🔍 Adding aggressive task state monitoring');
	
	// Monitor all task state changes
	const observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
				const task = mutation.target;
				if (task.classList.contains('task')) {
					const taskId = task.dataset.task;
					const isCompleted = task.classList.contains('completed');
					const storedState = localStorage.getItem(`task_${taskId}`) === 'true';
					
					console.log('🚨 TASK STATE CHANGE DETECTED:', {
						taskId: taskId,
						newState: isCompleted,
						storedState: storedState,
						timestamp: new Date().toISOString(),
						stack: new Error().stack
					});
					
					// If the state changed unexpectedly, restore it
					if (isCompleted !== storedState) {
						console.log('🔄 Restoring unexpected state change');
						if (storedState) {
							task.classList.add('completed');
						} else {
							task.classList.remove('completed');
						}
					}
				}
			}
		});
	});
	
	// Observe all task elements
	const tasks = document.querySelectorAll('.task');
	tasks.forEach(task => {
		observer.observe(task, {
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ['class']
		});
	});
	
	console.log('🔍 Task state monitoring enabled');
}

// Add a global scroll protection for mobile
function addMobileScrollProtection() {
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window;
	
	if (isMobile) {
		console.log('🛡️ Adding mobile scroll protection');
		
		// Prevent any task state changes during scroll
		let isCurrentlyScrolling = false;
		let scrollProtectionTimeout = null;
		
		window.addEventListener('scroll', function() {
			if (!isCurrentlyScrolling) {
				isCurrentlyScrolling = true;
				console.log('📱 Scroll started - protecting task states');
			}
			
			// Clear existing timeout
			if (scrollProtectionTimeout) {
				clearTimeout(scrollProtectionTimeout);
			}
			
			// Set timeout to allow task interactions after scroll stops
			scrollProtectionTimeout = setTimeout(() => {
				isCurrentlyScrolling = false;
				console.log('📱 Scroll stopped - allowing task interactions');
			}, 300);
		}, { passive: true });
		
		// Override any functions that might change task states during scroll
		const originalToggleTask = window.toggleTask;
		window.toggleTask = function(event) {
			if (isCurrentlyScrolling) {
				console.log('🚫 Blocking task toggle during scroll');
				return;
			}
			return originalToggleTask.call(this, event);
		};
	}
}

// Nuclear option: Lock task states completely during scroll
function addNuclearTaskProtection() {
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 'ontouchstart' in window;
	
	if (isMobile) {
		console.log('☢️ Adding nuclear task protection');
		
		let isScrolling = false;
		let scrollTimeout = null;
		
		// Track all task states before scroll
		let taskStatesBeforeScroll = new Map();
		
		window.addEventListener('scroll', function() {
			if (!isScrolling) {
				isScrolling = true;
				console.log('📱 Scroll started - capturing task states');
				
				// Capture all current task states
				const tasks = document.querySelectorAll('.task');
				tasks.forEach(task => {
					const taskId = task.dataset.task;
					const isCompleted = task.classList.contains('completed');
					taskStatesBeforeScroll.set(taskId, isCompleted);
					console.log(` Captured state for ${taskId}:`, isCompleted);
				});
			}
			
			// Clear existing timeout
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
			
			// Set timeout to restore states after scroll
			scrollTimeout = setTimeout(() => {
				isScrolling = false;
				console.log('📱 Scroll stopped - restoring task states');
				
				// Restore all task states to what they were before scroll
				const tasks = document.querySelectorAll('.task');
				tasks.forEach(task => {
					const taskId = task.dataset.task;
					const originalState = taskStatesBeforeScroll.get(taskId);
					const currentState = task.classList.contains('completed');
					
					if (originalState !== undefined && originalState !== currentState) {
						console.log(` Restoring ${taskId} from ${currentState} to ${originalState}`);
						
						if (originalState) {
							task.classList.add('completed');
						} else {
							task.classList.remove('completed');
						}
					}
				});
			}, 200);
		}, { passive: true });
		
		// Also monitor for any unexpected class changes
		const observer = new MutationObserver(function(mutations) {
			if (isScrolling) {
				mutations.forEach(function(mutation) {
					if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
						const task = mutation.target;
						if (task.classList.contains('task')) {
							const taskId = task.dataset.task;
							const originalState = taskStatesBeforeScroll.get(taskId);
							const newState = task.classList.contains('completed');
							
							if (originalState !== undefined && originalState !== newState) {
								console.log(` BLOCKED unexpected state change for ${taskId}: ${originalState} -> ${newState}`);
								
								// Immediately restore the original state
								if (originalState) {
									task.classList.add('completed');
								} else {
									task.classList.remove('completed');
								}
							}
						}
					}
				});
			}
		});
		
		// Observe all task elements
		const tasks = document.querySelectorAll('.task');
		tasks.forEach(task => {
			observer.observe(task, {
				attributes: true,
				attributeOldValue: true,
				attributeFilter: ['class']
			});
		});
	}
}

// Get user info from ISRU API via Netlify Function
async function fetchISRUUser(username) {
    try {
        console.log(' Fetching ISRU user data for:', username);
        
        // Use Netlify Function with your Resi proxies
        const response = await fetch('/.netlify/functions/proxy-isru', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        
        if (!response.ok) {
            throw new Error(`Proxy function failed with status: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('✅ ISRU User Data received via your Resi proxy');
        return userData;
    } catch (error) {
        console.error('❌ Error fetching ISRU user:', error);
        return null;
    }
}

// Update the header with user info
function updateUserHeader(userData) {
    if (!userData) return;
    
    const header = document.querySelector('.isru-header');
    if (!header) return;
    
    // Create personalized header content
    const personalizedHeader = `
        <div class="isru-logo">
            <img src="isru%20images/isru-logo-removebg-preview.png" alt="ISRU Logo" class="logo-image">
        </div>
        <div class="user-welcome">
            <div class="welcome-text">Welcome back, ${userData.username || 'ISRU Member'}!</div>
            ${userData.rank ? `<div class="user-rank">Rank: #${userData.rank}</div>` : ''}
            ${userData.stats ? `<div class="user-stats">${userData.stats}</div>` : ''}
        </div>
    `;
    
    header.innerHTML = personalizedHeader;
    console.log('✅ User header updated with:', userData.username);
}

// Add username input and login functionality
function addISRUUserLogin() {
    // Check if login already exists
    if (document.getElementById('isru-login-container')) return;
    
    const loginContainer = document.createElement('div');
    loginContainer.id = 'isru-login-container';
    loginContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #e31837;
        border-radius: 10px;
        padding: 15px;
        color: white;
        font-family: 'Inter', sans-serif;
        min-width: 250px;
    `;
    
    loginContainer.innerHTML = `
        <div style="margin-bottom: 10px; color: #e31837; font-weight: bold;">ISRU Login</div>
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" id="isru-username" placeholder="Enter ISRU username" style="
                flex: 1;
                padding: 8px;
                border: 1px solid #333;
                border-radius: 5px;
                background: #1a1a1a;
                color: white;
                font-size: 14px;
            ">
            <button id="isru-login-btn" style="
                padding: 8px 15px;
                background: #e31837;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            ">Login</button>
        </div>
        <div id="user-status" style="font-size: 12px; color: #888;">
            Not logged in
        </div>
        <button id="isru-logout-btn" style="
            display: none;
            padding: 5px 10px;
            background: #333;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            margin-top: 5px;
        ">Logout</button>
    `;
    
    document.body.appendChild(loginContainer);
    
    // Add event listeners
    const loginBtn = document.getElementById('isru-login-btn');
    const logoutBtn = document.getElementById('isru-logout-btn');
    const usernameInput = document.getElementById('isru-username');
    const userStatus = document.getElementById('user-status');
    
    loginBtn.onclick = async () => {
        const username = usernameInput.value.trim();
        if (!username) {
            userStatus.textContent = 'Please enter a username';
            userStatus.style.color = '#ff6b6b';
            return;
        }
        
        userStatus.textContent = 'Loading...';
        userStatus.style.color = '#ffd700';
        
        const userData = await fetchISRUUser(username);
        
        if (userData) {
            currentISRUUser = userData;
            updateUserHeader(userData);
            userStatus.textContent = `Logged in as ${username}`;
            userStatus.style.color = '#00ff00';
            logoutBtn.style.display = 'block';
            loginBtn.style.display = 'none';
            usernameInput.style.display = 'none';
            
            // Save to localStorage
            localStorage.setItem('isru_username', username);
            localStorage.setItem('isru_user_data', JSON.stringify(userData));
            
            // Personalize the experience
            personalizeExperience(userData);
        } else {
            userStatus.textContent = 'User not found or API error';
            userStatus.style.color = '#ff6b6b';
        }
    };
    
    logoutBtn.onclick = () => {
        currentISRUUser = null;
        userStatus.textContent = 'Not logged in';
        userStatus.style.color = '#888';
        logoutBtn.style.display = 'none';
        loginBtn.style.display = 'block';
        usernameInput.style.display = 'block';
        usernameInput.value = '';
        
        // Remove from localStorage
        localStorage.removeItem('isru_username');
        localStorage.removeItem('isru_user_data');
        
        // Reset header
        resetUserHeader();
    };
    
    // Check for saved login
    const savedUsername = localStorage.getItem('isru_username');
    const savedUserData = localStorage.getItem('isru_user_data');
    
    if (savedUsername && savedUserData) {
        try {
            currentISRUUser = JSON.parse(savedUserData);
            updateUserHeader(currentISRUUser);
            userStatus.textContent = `Logged in as ${savedUsername}`;
            userStatus.style.color = '#00ff00';
            logoutBtn.style.display = 'block';
            loginBtn.style.display = 'none';
            usernameInput.style.display = 'none';
            personalizeExperience(currentISRUUser);
        } catch (error) {
            console.error('Error loading saved user data:', error);
        }
    }
}

// Personalize the experience based on user data
function personalizeExperience(userData) {
    console.log('🎨 Personalizing experience for:', userData.username);
    
    // Update page title
    if (userData.username) {
        document.title = `ISRU Daily Mission Control - ${userData.username}`;
    }
    
    // Add personalized welcome message
    addPersonalizedWelcome(userData);
    
    // Update progress tracking with user context
    updateProgressWithUser(userData);
}

// Add personalized welcome message
function addPersonalizedWelcome(userData) {
    // Remove existing welcome if any
    const existingWelcome = document.getElementById('personalized-welcome');
    if (existingWelcome) existingWelcome.remove();
    
    const welcomeDiv = document.createElement('div');
    welcomeDiv.id = 'personalized-welcome';
    welcomeDiv.style.cssText = `
        text-align: center;
        margin: 20px 0;
        padding: 15px;
        background: rgba(227, 24, 55, 0.1);
        border: 1px solid rgba(227, 24, 55, 0.3);
        border-radius: 10px;
        color: #ffd700;
        font-weight: bold;
    `;
    
    welcomeDiv.innerHTML = `
        🚀 Welcome to your daily ISRU mission, ${userData.username || 'Commander'}! 
        ${userData.rank ? `<br><span style="color: #e31837;">Current Rank: #${userData.rank}</span>` : ''}
    `;
    
    // Insert after the header
    const header = document.querySelector('.isru-header');
    if (header && header.nextSibling) {
        header.parentNode.insertBefore(welcomeDiv, header.nextSibling);
    }
}

// Update progress tracking with user context
function updateProgressWithUser(userData) {
    // Load user-specific progress
    const userProgressKey = `isru_progress_${userData.username}`;
    const savedProgress = localStorage.getItem(userProgressKey);
    
    if (savedProgress) {
        try {
            const progress = JSON.parse(savedProgress);
            // Restore user-specific progress
            console.log('📊 Restored progress for user:', userData.username);
        } catch (error) {
            console.error('Error loading user progress:', error);
        }
    }
}

// Reset user header to default
function resetUserHeader() {
    const header = document.querySelector('.isru-header');
    if (header) {
        header.innerHTML = `
            <div class="isru-logo">
                <img src="isru%20images/isru-logo-removebg-preview.png" alt="ISRU Logo" class="logo-image">
            </div>
        `;
    }
    
    // Remove personalized welcome
    const existingWelcome = document.getElementById('personalized-welcome');
    if (existingWelcome) existingWelcome.remove();
    
    // Reset page title
    document.title = 'ISRU Daily Mission Control';
}

// Enhanced progress saving with user context
function saveUserProgress() {
    if (currentISRUUser) {
        const userProgressKey = `isru_progress_${currentISRUUser.username}`;
        const tasks = document.querySelectorAll('.task');
        const progress = {
            completed: Array.from(tasks).map(task => ({
                id: task.dataset.task,
                completed: task.classList.contains('completed'),
                timestamp: task.querySelector('.task-timestamp')?.textContent || ''
            })),
            streak: localStorage.getItem('currentStreak') || '0',
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(userProgressKey, JSON.stringify(progress));
        console.log(' Progress saved for user:', currentISRUUser.username);
    }
}

// ... existing code ... 