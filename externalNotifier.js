const externalNotifier = {
    async notify(certificate, activate) {
        fetch('https://httpbin.org/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                certificateId: certificate.id,
                message: `Certificate ${certificate.id} has been ${activate ? 'activated' : 'deactivated'}`,
            }),
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to notify external system of certificate ${activate ? 'activation' : 'deactivation'}`);
            }
            return res.json();
        })
        .catch(error => {
            console.error(error);
        });
    }
}

export default externalNotifier;
