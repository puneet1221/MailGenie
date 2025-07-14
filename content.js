console.log("Email Writer Extension Loaded");

function findComposeToolbar() {
    const selectors = ['.btC', '[role="group"]', 'IZ'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }

    }
    return null;
}
function createAIReplyButton() {
    const button = document.createElement('button'); // Use button element
    button.textContent = "AI Reply";
    button.style.marginRight = "10px";
    button.style.cursor = "pointer";
    button.setAttribute('data-tooltip', 'AI Reply');
    button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button";
    button.style.backgroundColor = "green";
    button.style.color = "white";
    button.style.padding = "5px 10px";
    button.style.borderRadius = "4px";
    button.style.border = "none";
    button.style.fontWeight = "bold";
    button.style.fontSize = "14px";
    button.style.transition = "background 0.2s";
    return button;
}

 const findEmailContent = () => {
    const selectors = ['.a3s.ail', '.h7', '.gmail_quote']
    for (const selector of selectors) {
        const contentElement = document.querySelector(selector);
        if (contentElement) {
            return contentElement.innerText.trim();
        }
    }
    return null;
}


function injectButton() {
    const existing = document.querySelector('.ai-reply-button');
    if (existing) {
        existing.remove();
    }
    const toolbar = findComposeToolbar();
    if (toolbar) {
        console.log("Compose toolbar found");
        const button = createAIReplyButton();
        button.classList.add('ai-reply-button');
        button.addEventListener('click', async () => {
            try {
                button.innerHTML = "generating..."
                button.disabled = true;
                button.backgroundColor = "#bdbdbd"; // grey
                button.style.cursor = "not-allowed";
                const emailContent = findEmailContent();
                const response = await fetch(' https://email-write-backend-1.onrender.com/api/email/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify({
                        emailContent: emailContent,
                        tone: "formal"
                    })
                });
                if (!response.ok) {
                    throw new Error('API Request Failed')
                }
                const generatedReply = await response.text();
                const composeBox = document.querySelector('[role="textbox"][g_editable="true"]')
                if (composeBox) {
                    composeBox.focus();
                    document.execCommand('insertText', false, generatedReply)
                } else {
                    console.error('compose box wasn\'t found')
                }
                composeBox.innerHTML = generatedReply;

            } catch (error) {
                alert('fail to generate reply', error);
                console.error(error)
            }
            finally {
                button.innerHTML = "AI Reply";
                button.disabled = false;
                button.style.backgroundColor = "green";
                button.style.cursor = "pointer";
            }


        });
        toolbar.insertBefore(button, toolbar.firstChild);
    }
}




const observer = new MutationObserver((mutations) => {
    //    console.log("xyz13");
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes)
        const hasComposeElement = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && (node.matches('.aDh,.btC,[role="group"]') || node.querySelector('.aDh,.btC,[role="group"]'))
        )
        console.log(hasComposeElement)
        if (hasComposeElement) {
            console.log("compose window detected");
            setTimeout(injectButton, 100); //TO ENSURE THE BUTTON IS INJECTED AFTER THE COMPOSE WINDOW IS FULLY LOADED
        }

    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});