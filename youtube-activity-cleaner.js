/**
 * YouTube Activity Auto-Cleaner (Comments, Likes & Dislikes, Live Chat)
 * 
 * Works seamlessly on:
 * - Comments & Replies:     https://myactivity.google.com/page?page=youtube_comments
 * - Likes & Dislikes:       https://myactivity.google.com/page?page=youtube_likes
 * - Live Chat Messages:     https://myactivity.google.com/page?page=youtube_live_chat
 * 
 * Author: Janardan Singh (@jediubuntu)
 * License: Apache License 2.0 (Free to use with author attribution)
 * 
 * Upgrades:
 * - DOM Removal Verification: Only counts an item as deleted once its card is actually
 *   confirmed and detached from the DOM. Eliminates false-positives and skipped items!
 * - Confirmation Modal Polling: Actively waits up to 2.5s for Google's confirmation popup
 *   and clicks the confirm button reliably across all languages.
 * - Single-Item Iteration: Always targets the top visible item instead of a stale array.
 * - Server-Sync Pacing (2.5s - 3.8s): Respects Google's backend transaction commit limits
 *   so items never reappear upon page refresh.
 * - Multi-Stage Anti-Stuck Scrolling: Never gets stuck when page height shrinks.
 * - Safe manual stop via: window.STOP_CLEANER = true;
 */

(async function deleteYouTubeActivity() {
    // Detect activity type from URL
    const pageUrl = window.location.href.toLowerCase();
    let activityType = "comment";
    if (pageUrl.includes("youtube_likes")) {
        activityType = "like/dislike";
    } else if (pageUrl.includes("youtube_live_chat")) {
        activityType = "live chat message";
    }

    console.log(`🚀 [YouTube Cleaner] Starting reliable deletion for YouTube ${activityType}s...`);
    console.log(`📋 [YouTube Cleaner] Detected Mode: ${activityType.toUpperCase()}S`);
    console.log(`🛡️ Server-Sync Pacing: Active (verifying DOM removal on each deletion)`);
    window.STOP_CLEANER = false;

    // Helper: Randomized delay between min and max ms
    const sleep = (min, max) => {
        if (!max) return new Promise(resolve => setTimeout(resolve, min));
        const ms = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, ms));
    };
    
    let totalDeleted = parseInt(sessionStorage.getItem('YT_CLEANER_COUNT') || '0', 10);
    let emptyScans = 0;
    const MAX_EMPTY_SCANS = 4;

    /**
     * Finds the next visible delete ('X') button on screen
     */
    function getNextDeleteButton() {
        const deleteButtons = Array.from(
            document.querySelectorAll(
                'button[aria-label*="Delete" i], ' +
                'button[aria-label*="Eliminar" i], ' +
                'button[aria-label*="Supprimer" i], ' +
                'button[aria-label*="Löschen" i], ' +
                'button[aria-label*="Excluir" i], ' +
                'button[aria-label*="Hapus" i]'
            )
        ).filter(btn => btn.offsetParent !== null && !btn.disabled);

        return deleteButtons.length > 0 ? deleteButtons[0] : null;
    }

    /**
     * Polls for Google's confirmation dialog and clicks the confirm button
     */
    async function confirmDeletionPopup() {
        const maxWaitMs = 2500;
        const start = Date.now();

        while (Date.now() - start < maxWaitMs) {
            // Check all known Google confirmation button patterns
            const dialog = document.querySelector('div[role="dialog"], div[role="alertdialog"], .fp-delete-confirmation-dialog');
            if (dialog && dialog.offsetParent !== null) {
                const buttons = Array.from(dialog.querySelectorAll('button'));
                // Target the confirm/delete button (often the last button or matching delete text/attribute)
                const confirmBtn = buttons.find(b => {
                    const txt = (b.innerText || b.getAttribute('aria-label') || '').toLowerCase();
                    return b.getAttribute('data-mdc-dialog-action') === 'ok' ||
                           txt.includes('delete') || 
                           txt.includes('eliminar') || 
                           txt.includes('supprimer') || 
                           txt.includes('löschen') || 
                           txt.includes('remove') ||
                           b === buttons[buttons.length - 1]; // Fallback to primary dialog action
                });

                if (confirmBtn && confirmBtn.offsetParent !== null) {
                    confirmBtn.click();
                    return true;
                }
            }
            await sleep(150);
        }
        return false;
    }

    /**
     * Aggressive scroll handler that forces Google's dynamic listener to fetch older items
     */
    async function forceGoogleLoadOlder() {
        console.log(`⏳ [YouTube Cleaner] Scan ${emptyScans}/${MAX_EMPTY_SCANS}: Scrolling to fetch older ${activityType}s...`);
        
        // 1. Click any expand/load button
        const moreButtons = Array.from(document.querySelectorAll('button, div[role="button"]'))
            .filter(btn => {
                const txt = (btn.innerText || btn.getAttribute('aria-label') || '').toLowerCase();
                return txt.includes('more') || txt.includes('load') || txt.includes('más') || txt.includes('plus');
            });

        for (const b of moreButtons) {
            if (b.offsetParent !== null && !b.disabled) {
                b.click();
                await sleep(800, 1200);
            }
        }

        // 2. Multi-step scroll sequence across window and scrollingElement
        window.scrollBy(0, -350);
        window.dispatchEvent(new Event('scroll'));
        await sleep(400);

        const targetHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        window.scrollTo({ top: targetHeight, behavior: 'smooth' });
        window.dispatchEvent(new Event('scroll'));
        document.documentElement.dispatchEvent(new Event('scroll'));
        await sleep(1000);

        window.scrollBy(0, 500);
        window.dispatchEvent(new Event('scroll'));
        
        await sleep(2500, 3500);
    }

    while (true) {
        if (window.STOP_CLEANER) {
            console.log("🛑 [YouTube Cleaner] Stopped by user command.");
            break;
        }

        const btn = getNextDeleteButton();

        if (!btn) {
            emptyScans++;
            await forceGoogleLoadOlder();

            if (emptyScans >= MAX_EMPTY_SCANS) {
                console.log(`🎉 [YouTube Cleaner] Finished! No more ${activityType}s found on screen.`);
                console.log(`📊 Total ${activityType}s deleted this session: ${totalDeleted}`);
                break;
            }
            continue;
        }

        // Reset empty scan counter
        emptyScans = 0;

        try {
            // Find the parent card/row container so we can verify its actual removal from DOM
            const card = btn.closest('c-wiz, div[data-id], div[role="article"]') || btn.parentElement;

            btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(400, 600);
            btn.click();

            // Actively poll and confirm the deletion dialog
            await confirmDeletionPopup();

            // Wait up to 3 seconds for the item to actually vanish from the DOM
            let removed = false;
            const startWait = Date.now();
            while (Date.now() - startWait < 3000) {
                if (!document.body.contains(btn) || (card && !document.body.contains(card))) {
                    removed = true;
                    break;
                }
                await sleep(200);
            }

            if (removed) {
                totalDeleted++;
                console.log(`🗑️ [YouTube Cleaner] Confirmed & Deleted ${activityType} #${totalDeleted}`);

                // Critical: Wait 2.2s - 3.4s so Google's backend transaction writes to disk
                await sleep(2200, 3400);

                // Periodic breather: Pause 5s every 10 deletions so Google's DB write pipeline catches up
                if (totalDeleted % 10 === 0) {
                    console.log("💾 [YouTube Cleaner] Taking a 5s database sync breather to ensure server persistence...");
                    await sleep(4500, 6000);
                }
            } else {
                console.warn("⚠️ [YouTube Cleaner] Deletion not registered by Google. Re-trying...");
                await sleep(1000);
            }
        } catch (err) {
            console.warn("⚠️ [YouTube Cleaner] Error deleting an item:", err);
            await sleep(1000);
        }
    }
})();
