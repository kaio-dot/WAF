//Constantes globais
const MAX_SIZE_BODY = 1* 1024 *1024; //1MB
const TIMEOUT_REQUEST = 5000; //5 Segundos
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE']; //Métodos permitidos

export const LIMITS = {
    MAX_BODY_SIZE: MAX_SIZE_BODY,
    REQUEST_TIMEOUT: TIMEOUT_REQUEST,
    ALLOWED_METHODS
};

