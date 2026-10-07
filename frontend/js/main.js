async function apiFetch(
    url,
    options = {}
) {

    const config = {
        ...options,

        headers: {
            "Content-Type":
                "application/json",

            ...(options.headers || {})
        }
    };


    const response =
        await fetch(
            url,
            config
        );


    const data =
        await response
            .json()
            .catch(() => ({}));


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed."
        );

    }


    return data;
}



async function getCurrentUser() {

    try {

        const data =
            await apiFetch(
                "/api/auth/me"
            );

        return data.user;

    } catch (error) {

        return null;

    }
}



async function logout() {

    try {

        await apiFetch(
            "/api/auth/logout",
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.error(error);

    }


    window.location.href =
        "/login.html";
}



function showMessage(
    elementId,
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;
}



function formatDate(date) {

    if (!date) {
        return "";
    }

    return new Date(
        date
    ).toLocaleDateString();
}