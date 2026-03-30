# read-nfc.ps1 - Lee el UID de una tarjeta NFC usando Windows Smart Card API
# Devuelve JSON con el UID o null si no hay tarjeta

$ErrorActionPreference = 'SilentlyContinue'

# Cargar WinSCard API
$winscard = @"
using System;
using System.Runtime.InteropServices;

public class WinSCard {
    [DllImport("winscard.dll")]
    public static extern int SCardEstablishContext(uint dwScope, IntPtr pvReserved1, IntPtr pvReserved2, out IntPtr phContext);
    
    [DllImport("winscard.dll", CharSet=CharSet.Unicode)]
    public static extern int SCardListReadersW(IntPtr hContext, string mszGroups, IntPtr mszReaders, ref uint pcchReaders);
    
    [DllImport("winscard.dll", CharSet=CharSet.Unicode)]
    public static extern int SCardConnectW(IntPtr hContext, string szReader, uint dwShareMode, uint dwPreferredProtocols, out IntPtr phCard, out uint pdwActiveProtocol);
    
    [DllImport("winscard.dll")]
    public static extern int SCardTransmit(IntPtr hCard, IntPtr pioSendPci, byte[] pbSendBuffer, uint cbSendLength, IntPtr pioRecvPci, byte[] pbRecvBuffer, ref uint pcbRecvLength);
    
    [DllImport("winscard.dll")]
    public static extern int SCardDisconnect(IntPtr hCard, uint dwDisposition);
    
    [DllImport("winscard.dll")]
    public static extern int SCardReleaseContext(IntPtr hContext);
    
    [DllImport("winscard.dll")]
    public static extern int SCardFreeMemory(IntPtr hContext, IntPtr pvMem);

    // T1 protocol PCI
    [DllImport("winscard.dll")]
    public static extern IntPtr SCardGetAttrib(IntPtr hCard, uint dwAttrId, byte[] pbAttr, ref uint pcbAttrLen);
    
    public static IntPtr pioSendPciT0 = IntPtr.Zero;
    public static IntPtr pioSendPciT1 = IntPtr.Zero;
    
    static WinSCard() {
        IntPtr hModule = LoadLibrary("winscard.dll");
        pioSendPciT0 = GetProcAddress(hModule, "g_rgSCardT0Pci");
        pioSendPciT1 = GetProcAddress(hModule, "g_rgSCardT1Pci");
    }
    
    [DllImport("kernel32.dll", CharSet=CharSet.Ansi)]
    static extern IntPtr LoadLibrary(string lpFileName);
    
    [DllImport("kernel32.dll", CharSet=CharSet.Ansi)]
    static extern IntPtr GetProcAddress(IntPtr hModule, string procName);
}
"@

try {
    Add-Type -TypeDefinition $winscard -Language CSharp 2>$null
} catch {}

function Get-NFCCardUID {
    $ctx = [IntPtr]::Zero
    $result = [WinSCard]::SCardEstablishContext(2, [IntPtr]::Zero, [IntPtr]::Zero, [ref]$ctx)
    if ($result -ne 0) {
        return $null
    }
    
    try {
        # Listar lectores
        [uint32]$bufLen = 0
        $result = [WinSCard]::SCardListReadersW($ctx, $null, [IntPtr]::Zero, [ref]$bufLen)
        if ($result -ne 0 -or $bufLen -eq 0) { return $null }
        
        $buf = [System.Runtime.InteropServices.Marshal]::AllocHGlobal($bufLen * 2)
        try {
            $result = [WinSCard]::SCardListReadersW($ctx, $null, $buf, [ref]$bufLen)
            if ($result -ne 0) { return $null }
            
            $readerStr = [System.Runtime.InteropServices.Marshal]::PtrToStringUni($buf)
            if (-not $readerStr) { return $null }
        } finally {
            [System.Runtime.InteropServices.Marshal]::FreeHGlobal($buf)
        }
        
        # Conectar al primer lector
        $card = [IntPtr]::Zero
        [uint32]$protocol = 0
        # SCARD_SHARE_SHARED=2, SCARD_PROTOCOL_T0|T1=3
        $result = [WinSCard]::SCardConnectW($ctx, $readerStr, 2, 3, [ref]$card, [ref]$protocol)
        if ($result -ne 0) {
            @{ status = "no_reader" } | ConvertTo-Json -Compress
            exit
        }
        
        try {
            # Enviar APDU: GET UID (FF CA 00 00 00)
            $sendBuf = [byte[]]@(0xFF, 0xCA, 0x00, 0x00, 0x00)
            $recvBuf = New-Object byte[] 256
            [uint32]$recvLen = 256
            
            $pci = if ($protocol -eq 1) { [WinSCard]::pioSendPciT0 } else { [WinSCard]::pioSendPciT1 }
            
            $result = [WinSCard]::SCardTransmit($card, $pci, $sendBuf, [uint32]$sendBuf.Length, [IntPtr]::Zero, $recvBuf, [ref]$recvLen)
            if ($result -ne 0) { return $null }
            
            # Los últimos 2 bytes son SW1 SW2, el UID está antes
            if ($recvLen -gt 2) {
                $sw1 = $recvBuf[$recvLen - 2]
                $sw2 = $recvBuf[$recvLen - 1]
                if ($sw1 -eq 0x90 -and $sw2 -eq 0x00) {
                    $uidBytes = $recvBuf[0..($recvLen - 3)]
                    $uid = ($uidBytes | ForEach-Object { $_.ToString("X2") }) -join ":"
                    return @{ uid = $uid; reader = $readerStr }
                }
            }
            return $null
        } finally {
            [WinSCard]::SCardDisconnect($card, 0) | Out-Null
        }
    } finally {
        [WinSCard]::SCardReleaseContext($ctx) | Out-Null
    }
}

$cardData = Get-NFCCardUID
if ($cardData) {
    @{ status = "detected"; uid = $cardData.uid; reader = $cardData.reader } | ConvertTo-Json -Compress
} else {
    @{ status = "no_card" } | ConvertTo-Json -Compress
}
