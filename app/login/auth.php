<?php
session_start();

// Asegúrate de que los datos de entrada existen antes de usarlos
if (isset($_POST['username']) && isset($_POST['password'])) {
    // Usa la función trim para eliminar espacios en blanco al principio y al final
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // Usa la función htmlspecialchars para escapar caracteres especiales
    $username = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');
    
    if (empty($username) || empty($password)) {
        // Una o ambas variables están vacías
        echo "Error: el nombre de usuario y la contraseña son requeridos.";
        exit;
    }

    if (ldapLogin($username, $password)) {
        /**
         * Después de que el usuario haya iniciado sesión, 
         * se rediríge de vuelta a la URL almacenada en la sesión
         */
        
        // print_r($_SESSION['redirect_url']); exit;


        if (isset($_SESSION['redirect_url'])) {
            $redirect_url = $_SESSION['redirect_url'];
            // Borra la URL de la sesión para no redirigir al usuario de nuevo en futuros inicios de sesión
            unset($_SESSION['redirect_url']); 
            header('Location: ' . '../index.php');
            exit; 
        } else {
            header('Location: ' . '../index.php');
        }
        //echo 'Inicio de sesión exitoso';
    } else {
        echo 'Inicio de sesión fallido';
        header('Location: ' . '../login/index.php');
    }

} else {
    // Maneja el caso en que los datos de entrada no existen
    echo "Error: los datos de entrada no existen.";
    exit;
}

function connectToLdap() {
    $ldapServer = 'ldap://ldap.utp.edu.co:778';
    $ldapUser = 'uid=consultacas,dc=utp';
    $ldapPassword = 'er=?34//__12RT';

    $cLDAP = ldap_connect($ldapServer);
    if (!$cLDAP) {
        throw new Exception('Could not connect to LDAP server');
    }

    $rLDAP = ldap_bind($cLDAP, $ldapUser, $ldapPassword);
    if (!$rLDAP) {
        throw new Exception('Could not bind to LDAP server');
    }
    return $cLDAP;
}

function ldapLogin($username, $password) {
    $ouUsers = false;
    $ouContractors = false;

    $cLDAP = connectToLdap();

    // Intenta autenticar al usuario en la ou Usuarios
    $userDn = 'uid=' . $username . ',ou=Usuarios,dc=utp';
    $ouUsers = @ldap_bind($cLDAP, $userDn, $password);

    // Si no esta valida tambien en la ou Contratistas
    if (!$ouUsers) {
        $userDn = 'uid=' . $username . ',ou=Contratistas,dc=utp';
        $ouContractors = @ldap_bind($cLDAP, $userDn, $password);
    }

    $rLDAP = $ouUsers || $ouContractors;

    if(!$rLDAP) {
        // Autenticación fallida
        return false;
    }   


    // Autenticación exitosa, establecer valores de sesión
    $ldapSearch = sprintf('(uid=%s)', ldap_escape($username, '', LDAP_ESCAPE_FILTER));
    $result = ldap_search($cLDAP, 'dc=utp', $ldapSearch);
    if (!$result) {
        throw new Exception('Error in LDAP search');
    }

    $infoldap = ldap_get_entries($cLDAP, $result);

    $_SESSION["phpCAS"]["user"] = isset($username) ? $username : '';
    $_SESSION['phpCAS']['documento'] = isset($infoldap[0]['numerodocumento'][0]) ? $infoldap[0]['numerodocumento'][0] : '';
    $_SESSION['phpCAS']['idtercero'] = isset($infoldap[0]['idtercero'][0]) ? $infoldap[0]['idtercero'][0] : '';
    $_SESSION['phpCAS']['email'] = isset($infoldap[0]['mail'][0]) ? $infoldap[0]['mail'][0] : '';
    $_SESSION['phpCAS']['cn'] = isset($infoldap[0]['cn'][0]) ? $infoldap[0]['cn'][0] : '';
    $_SESSION['phpCAS']['dn'] = isset($infoldap[0]['dn']) ? $infoldap[0]['dn'] : '';

    $ldapSearch = sprintf('(uniquemember=%s)', ldap_escape($_SESSION['phpCAS']['dn'], '', LDAP_ESCAPE_DN));
    $result = ldap_search($cLDAP, 'ou=Grupos,dc=utp', $ldapSearch);
    $grupos = ldap_get_entries($cLDAP, $result);

    $_SESSION['phpCAS']['roles'] = [];
    for ($j = 0; $j < $grupos['count']; $j++) {
        $_SESSION['phpCAS']['roles'][$j] = $grupos[$j]['cn'][0];
    }

    $_SESSION['loggedin'] = true;
    return true;
}


function destroySession() {
    $_SESSION = array();
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
}

