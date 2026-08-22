document.addEventListener("DOMContentLoaded", function() {
    var tg = window.Telegram ? window.Telegram.WebApp : null;
    if (tg) {
        tg.expand();
        tg.ready();
    }

    var TONAPI_KEY = "AFN27N234JRDMBYAAAAAK7DCUDKGTMwTPROSP2PFBJQQBGPUX477IK4H2KAXIIWKNTOUFLY";
    var checkBtn = document.getElementById('check-btn');
    var walletInput = document.getElementById('wallet-input');

    if (checkBtn) {
        checkBtn.onclick = analyzeWallet;
    }

    if (walletInput) {
        walletInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") analyzeWallet();
        });
    }

    async function analyzeWallet() {
        var address = walletInput.value.trim();
        if (!address) {
            alert("Введите адрес кошелька!");
            return;
        }

        document.getElementById('loader').style.display = 'block';

        try {
            var headers = { "X-API-Key": TONAPI_KEY };

            var tonPrice = 5.5;
            try {
                var rateResp = await fetch("https://tonapi.io/v2/rates?tokens=ton&currencies=usd", { headers: headers });
                var rateData = await rateResp.json();
                if (rateData && rateData.rates && rateData.rates.TON) {
                    tonPrice = rateData.rates.TON.prices.USD;
                }
            } catch(e) {}

            var accResp = await fetch("https://tonapi.io/v2/accounts/" + encodeURIComponent(address), { headers: headers });
            if (!accResp.ok) throw new Error("Кошелек не найден");
            var accData = await accResp.json();
            var tonBalance = (accData.balance || 0) / Math.pow(10, 9);

            var nftResp = await fetch("https://tonapi.io/v2/accounts/" + encodeURIComponent(address) + "/nfts?limit=100", { headers: headers });
            var nftData = await nftResp.json();

            var n888Count = 0, n888Floor = 0, userCount = 0, userFloor = 0, nftCount = 0, nftFloor = 0, scamCount = 0;
            var FRAGMENT_USERNAMES = "0:0e41dc1dc3c9067ed24248580e12b3359818d83dee0304fadcf0d57c72f0a095";
            var FRAGMENT_NUMBERS = "0:735a1cc316212d26d70eb0041eb4ef50949d2fb2d39bc13106d80d28b7e2898b";

            (nftData.nft_items || []).forEach(function(item) {
                var collAddr = (item.collection && item.collection.address) ? item.collection.address.toLowerCase() : "";
                var name = (item.metadata && item.metadata.name) ? item.metadata.name : "";
                var isScam = (item.metadata && item.metadata.is_scam)  item.trust === "scam"  item.trust === "none" || name.toLowerCase().indexOf("unlock") !== -1;

                if (isScam) {
                    scamCount++;
                } else {
                    var floor = ((item.collection && item.collection.floor_price) ? item.collection.floor_price.value : 0) / Math.pow(10, 9);
                    if (collAddr === FRAGMENT_NUMBERS || name.indexOf("+888") !== -1) {
                        n888Count++; n888Floor += floor;
                    } else if (collAddr === FRAGMENT_USERNAMES || name.indexOf("@") !== -1) {
                        userCount++; userFloor += floor;
                    } else {
                        nftCount++; nftFloor += floor;
                    }
                }
            });

            var totalPortfolioTon = tonBalance + n888Floor + userFloor + nftFloor;

            document.getElementById('total-ton').innerText = totalPortfolioTon.toFixed(2) + " GRAM";
            document.getElementById('total-usd').innerText = "~$" + (totalPortfolioTon * tonPrice).toFixed(2);

            document.getElementById('val-888').innerText = n888Floor.toFixed(1) + " GRAM ≈ $" + (n888Floor * tonPrice).toFixed(0);
            document.getElementById('count-888').innerText = "найдено " + n888Count + " штук";

            document.getElementById('val-user').innerText = userFloor.toFixed(1) + " GRAM ≈ $" + (userFloor * tonPrice).toFixed(0);
            document.getElementById('count-user').innerText = "найдено " + userCount + " штук";

            document.
