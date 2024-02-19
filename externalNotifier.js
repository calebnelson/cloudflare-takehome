const externalNotifier = {
    async notify(certificateId, activate) {
        fetch('https://httpbin.org/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                certificateId: certificateId,
                message: `Certificate ${certificateId} has been ${activate ? 'activated' : 'deactivated'}`,
            }),
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Failed to notify external system of certificate ${certificateId} ${activate ? 'activation' : 'deactivation'}`);
            }
            console.log(res);
            return res;
        })
        .catch(error => {
            console.error(error);
        });
    }
}

export default externalNotifier;
