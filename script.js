        const frm = document.querySelector('#frm');
        const output = document.querySelector("#output");
        const spinner = document.querySelector("#loading");
        const qrCodeElement = document.querySelector("#qrcode");
        const btnSave = document.querySelector("#btnsave");
        const themeToggle = document.querySelector("#themeToggle");
        const contentType = document.querySelector("#contentType");
        const placeholder = document.querySelector("#placeholder");
        const historyContainer = document.querySelector("#history");
        const colorDark = document.querySelector("#colorDark");
        const colorLight = document.querySelector("#colorLight");
        const colorDarkText = document.querySelector("#colorDarkText");
        const colorLightText = document.querySelector("#colorLightText");
        const marginInput = document.querySelector("#margin");
        const marginValue = document.querySelector("#marginValue");
        const clearHistoryBtn = document.querySelector("#clearHistory");
        const typeButtons = document.querySelectorAll(".type-btn");
        
        
        const sections = {
            url: document.querySelector("#urlSection"),
            text: document.querySelector("#textSection"),
            email: document.querySelector("#emailSection"),
            phone: document.querySelector("#phoneSection"),
            wifi: document.querySelector("#wifiSection"),
            vcard: document.querySelector("#vcardSection")
        };
        
       
        let qrHistory = JSON.parse(localStorage.getItem('qrHistory')) || [];
        
       
        function init() {
            initTheme();
            updateColorText();
            renderHistory();
            updateMarginValue();
            showCurrentSection();
            
            
            frm.addEventListener('submit', generateQRCode);
            themeToggle.addEventListener('click', toggleTheme);
            colorDark.addEventListener('input', updateColorText);
            colorLight.addEventListener('input', updateColorText);
            colorDarkText.addEventListener('input', updateColorFromText);
            colorLightText.addEventListener('input', updateColorFromText);
            contentType.addEventListener('change', showCurrentSection);
            marginInput.addEventListener('input', updateMarginValue);
            clearHistoryBtn.addEventListener('click', clearHistory);
            btnSave.addEventListener('click', saveQRCode);
            
           
            typeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const type = btn.getAttribute('data-type');
                    contentType.value = type;
                    showCurrentSection();
                });
            });
        }
        
        
        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else if (savedTheme === 'light') {
                document.documentElement.classList.remove('dark');
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            }
        }
        
        function toggleTheme() {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        }
        
       
        function updateColorText() {
            colorDarkText.value = colorDark.value;
            colorLightText.value = colorLight.value;
        }
        
        
        function updateColorFromText(e) {
            const id = e.target.id;
            if (id === 'colorDarkText') {
                colorDark.value = colorDarkText.value;
            } else if (id === 'colorLightText') {
                colorLight.value = colorLightText.value;
            }
        }
        
        
        function updateMarginValue() {
            marginValue.textContent = marginInput.value;
        }
        
        
        function showCurrentSection() {
            
            Object.values(sections).forEach(section => {
                section.classList.add('hidden');
            });
            
            
            const type = contentType.value;
            if (sections[type]) {
                sections[type].classList.remove('hidden');
                sections[type].classList.add('fade-in');
            }
        }
        
        
        function generateQRCode(e) {
            e.preventDefault();
            
            let content = '';
            const type = contentType.value;
            
            switch (type) {
                case 'url':
                    const url = document.querySelector("#url").value;
                    if (!url) {
                        showAlert("Please enter a valid URL", "error");
                        return;
                    }
                    content = url;
                    break;
                    
                case 'text':
                    const text = document.querySelector("#text").value;
                    if (!text) {
                        showAlert("Please enter some text", "error");
                        return;
                    }
                    content = text;
                    break;
                    
                case 'email':
                    const email = document.querySelector("#email").value;
                    if (!email) {
                        showAlert("Please enter a valid email address", "error");
                        return;
                    }
                    content = `mailto:${email}`;
                    break;
                    
                case 'phone':
                    const phone = document.querySelector("#phone").value;
                    if (!phone) {
                        showAlert("Please enter a phone number", "error");
                        return;
                    }
                    content = `tel:${phone}`;
                    break;
                    
                case 'wifi':
                    const ssid = document.querySelector("#ssid").value;
                    const password = document.querySelector("#password").value;
                    const encryption = document.querySelector("#encryption").value;
                    
                    if (!ssid) {
                        showAlert("Please enter a network name (SSID)", "error");
                        return;
                    }
                    
                    content = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
                    break;
                    
                case 'vcard':
                    const name = document.querySelector("#name").value;
                    const contactEmail = document.querySelector("#contactEmail").value;
                    const contactPhone = document.querySelector("#contactPhone").value;
                    const company = document.querySelector("#company").value;
                    
                    if (!name) {
                        showAlert("Please enter a name", "error");
                        return;
                    }
                    
                    content = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}`;
                    if (contactEmail) content += `\nEMAIL:${contactEmail}`;
                    if (contactPhone) content += `\nTEL:${contactPhone}`;
                    if (company) content += `\nORG:${company}`;
                    content += '\nEND:VCARD';
                    break;
                    
                default:
                    showAlert("Invalid content type selected", "error");
                    return;
            }
            
            const size = parseInt(document.querySelector("#size").value);
            const clrDark = colorDark.value;
            const clrLight = colorLight.value;
            const ecLevel = document.querySelector("#ecLevel").value;
            const margin = parseInt(marginInput.value);
            
            
            spinner.style.display = "flex";
            placeholder.style.display = "none";
            qrCodeElement.innerHTML = "";
            
            setTimeout(() => {
                
                while (qrCodeElement.firstChild) {
                    qrCodeElement.removeChild(qrCodeElement.firstChild);
                }
                
                
                const qrcode = new QRCode(qrCodeElement, {
                    text: content,
                    width: size,
                    height: size,
                    colorDark: clrDark,
                    colorLight: clrLight,
                    correctLevel: QRCode.CorrectLevel[ecLevel],
                    margin: margin
                });
                
                
                spinner.style.display = "none";
                
                
                addToHistory(content, type, size, clrDark, clrLight);
                
                
                createDownloadLink();
                
            }, 800);
        }
        
       
        function addToHistory(content, type, size, darkColor, lightColor) {
    
    const safeContent = content || "";
    const safeType = type || "unknown";
    const safeSize = size || 200;
    const safeDark = darkColor || "#000000";
    const safeLight = lightColor || "#ffffff";

    qrHistory.unshift({
        content: safeContent,
        type: safeType,
        size: safeSize,
        darkColor: safeDark,
        lightColor: safeLight,
        timestamp: new Date().toISOString()
    });

   
    if (qrHistory.length > 5) {
        qrHistory.pop();
    }

    
    localStorage.setItem('qrHistory', JSON.stringify(qrHistory));

    
    renderHistory();
}
        
        
        function renderHistory() {
    historyContainer.innerHTML = '';
    
    if (qrHistory.length === 0) {
        historyContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No history yet</p>';
        return;
    }
    
    qrHistory.forEach((item, index) => {
        
        const safeType = item?.type ? item.type.toUpperCase() : "UNKNOWN";
        const safeTypeClass = item?.type || "unknown";
        const safeContent = item?.content || "";
        const safeDark = item?.darkColor || "#000";
        const safeLight = item?.lightColor || "#fff";
        const safeTime = item?.timestamp ? new Date(item.timestamp).toLocaleString() : "";

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item flex items-center p-3 bg-gray-100 dark:bg-dark-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition';
        historyItem.innerHTML = `
            <div class="w-10 h-10 mr-3 flex-shrink-0" style="background-color: ${safeLight}">
                <div class="w-full h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="${safeDark}" d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8-12v8h8V3h-8zm6 6h-4V5h4v4zm0 10h2v2h-2zm-6-6h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm0-4h2v2h-2zm2 2h2v2h-2z"/>
                    </svg>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                    <div class="font-medium truncate">${safeContent.substring(0, 25)}${safeContent.length > 25 ? '...' : ''}</div>
                    <span class="type-badge ${safeTypeClass}">${safeType}</span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${safeTime}</div>
            </div>
        `;
        
        
        historyItem.addEventListener('click', () => {
            if (!item?.type) return; 

            contentType.value = item.type;
            showCurrentSection();

            switch (item.type) {
                case 'url':
                    document.querySelector("#url").value = safeContent;
                    break;
                case 'text':
                    document.querySelector("#text").value = safeContent;
                    break;
                case 'email':
                    document.querySelector("#email").value = safeContent.replace('mailto:', '');
                    break;
                case 'phone':
                    document.querySelector("#phone").value = safeContent.replace('tel:', '');
                    break;
                case 'wifi':
                    const wifiData = parseWifiString(safeContent);
                    if (wifiData) {
                        document.querySelector("#ssid").value = wifiData.ssid;
                        document.querySelector("#password").value = wifiData.password;
                        document.querySelector("#encryption").value = wifiData.encryption;
                    }
                    break;
                case 'vcard':
                    const vcardLines = safeContent.split('\n');
                    const nameLine = vcardLines.find(line => line.startsWith('FN:'));
                    if (nameLine) {
                        document.querySelector("#name").value = nameLine.replace('FN:', '');
                    }
                    break;
            }

            document.querySelector("#size").value = item.size || 200;
            colorDark.value = safeDark;
            colorLight.value = safeLight;
            updateColorText();

            generateQRCode({ preventDefault: () => {} });
        });
        
        historyContainer.appendChild(historyItem);
    });
}

        
      
        function parseWifiString(wifiString) {
           
            const regex = /^WIFI:S:(.+?);T:(.+?);P:(.+?);;$/;
            const match = wifiString.match(regex);
            
            if (match) {
                return {
                    ssid: match[1],
                    encryption: match[2],
                    password: match[3]
                };
            }
            return null;
        }
        
       
        function createDownloadLink() {
            const img = qrCodeElement.querySelector('img');
            if (img) {
                btnSave.onclick = () => {
                    const link = document.createElement('a');
                    link.href = img.src;
                    link.download = 'qrcode.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
            }
        }
        
       
        function saveQRCode() {
            const img = qrCodeElement.querySelector('img');
            if (!img || img.id === 'noqr') {
                showAlert("Please generate a QR code first", "error");
            }
        }
        
        
        function clearHistory() {
            qrHistory = [];
            localStorage.removeItem('qrHistory');
            renderHistory();
            showAlert("History cleared", "success");
        }
        
       
        function showAlert(message, type) {
            
            const existingAlert = document.querySelector('.custom-alert');
            if (existingAlert) existingAlert.remove();
            
            const alert = document.createElement('div');
            alert.className = `custom-alert fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white ${
                type === 'error' ? 'bg-red-500' : 'bg-green-500'
            } z-50 transition-all transform translate-x-0 opacity-100`;
            alert.textContent = message;
            
            document.body.appendChild(alert);
            
            
            setTimeout(() => {
                alert.style.transform = 'translateX(100%)';
                alert.style.opacity = '0';
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }, 3000);
        }
        
        
        window.addEventListener('DOMContentLoaded', init);
  