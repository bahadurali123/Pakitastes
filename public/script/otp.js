const etime = document.getElementById("epirtime").innerText;
console.log("Expiry time is: ", etime);

// expiry count downer
const timefun = () => {
    const currentTime = new Date().getTime();
    const timeDifference = etime - currentTime;

    if (timeDifference <= 0) {
        clearInterval(intervalId);
        document.getElementById('expiryTime').innerText = 'OTP expired';
        return;
    }
    const minutes = Math.floor((timeDifference / 1000 / 60) << 0);
    const seconds = Math.floor((timeDifference / 1000) % 60);

    document.getElementById('expiryTime').innerText = `Min ${minutes}:${seconds.toString().padStart(2, '0')}`;
};
const intervalId = setInterval(timefun, 1000);

// post data for verification
const verifybtn = document.getElementById("verifybtn");
console.log("Verify", verifybtn);
const verify = async () => {
    const otp = document.getElementById("otp").value;
    const email = document.getElementById("email").innerText;
    console.log("OTP", otp);
    console.log("email", email);
    const data = await fetch('/bahadur/v1/otpverify', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code: otp,
            email,
        })
    })
    console.log("Data:", data);
    const responce = await data.json();
    if (responce.message === 'Successfully verified!') {
        window.location.pathname = '/bahadur/v1/commerce';
    }
    console.log("Responce:", responce, responce.message);
};
verifybtn.addEventListener("click", verify);