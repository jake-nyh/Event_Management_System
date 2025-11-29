import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import api from '../services/api';
import { Camera, CameraOff, RefreshCw, QrCode, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { banners } from '../lib/designSystem';

export default function AdminQRValidationPage() {
  const [qrData, setQrData] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const handleValidateQR = async (dataToValidate?: string) => {
    const data = dataToValidate || qrData;

    if (!data.trim()) {
      toast({
        title: "Error",
        description: 'Please enter QR code data',
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setValidationResult(null);

    try {
      const response = await api.post('/qr-codes/admin/validate', { qrData: data });

      if (response.data.success) {
        setValidationResult(response.data.data);
        setTicketId(response.data.data.ticket?.id || '');
        toast({
          title: "Success",
          description: 'QR code validated successfully',
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message || 'Failed to validate QR code',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error validating QR code:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || 'Failed to validate QR code',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      toast({
        title: "Success",
        description: 'QR scanner started successfully',
      });
    } catch (error: any) {
      console.error('Error starting QR scanner:', error);
      toast({
        title: "Scanner Error",
        description: 'Failed to start QR scanner. Please check permissions.',
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const simulateQRScan = () => {
    // Simulate QR scan with sample data in valid JSON format
    // Note: This will fail validation since it uses a fake UUID, but demonstrates the correct format
    const sampleTicketId = 'demo-' + Math.random().toString(36).substring(2, 10);
    const sampleQRData = JSON.stringify({
      t: sampleTicketId,
      tt: 'demo-ticket-type',
      s: 'active'
    });
    setQrData(sampleQRData);
    toast({
      title: "Demo QR Scanned",
      description: 'Sample QR code generated (will fail validation - use real ticket QR)',
    });
    stopCamera();
    // Pass the data directly to avoid race condition with setState
    handleValidateQR(sampleQRData);
  };

  const handleScanResult = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      setQrData(result);
      toast({
        title: "Success",
        description: 'QR code scanned successfully',
      });
      stopCamera();
      // Pass the data directly to avoid race condition with setState
      handleValidateQR(result);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleMarkAsUsed = async () => {
    if (!ticketId.trim()) {
      toast({
        title: "Error",
        description: 'Please validate a QR code first',
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/qr-codes/admin/mark-used', {
        ticketId,
        qrData
      });
      
      if (response.data.success) {
        setValidationResult(null);
        setTicketId('');
        setQrData('');
        toast({
          title: "Success",
          description: 'Ticket marked as used successfully',
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message || 'Failed to mark ticket as used',
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error marking ticket as used:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to mark ticket as used',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQrData('');
    setValidationResult(null);
    setTicketId('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Premium Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
        {/* Banner Image Overlay */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: `url(${banners.hero})`,
          }}
        />

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40"></div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6 border border-white/20">
              <QrCode className="w-4 h-4" />
              <span>Admin Tools</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
              QR Code
              <span className="block mt-2 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                Validation System
              </span>
            </h1>

            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Scan and validate QR codes for seamless event check-in and ticket verification.
            </p>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32L80,37.3C160,43,320,53,480,48C640,43,800,21,960,16C1120,11,1280,21,1360,26.7L1440,32L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z" fill="rgb(248, 250, 252)"/>
          </svg>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Scanning Section */}
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Scan QR Code</CardTitle>
                  <CardDescription>
                    Use camera to scan or enter data manually
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* QR Scanner View */}
              {isScanning ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-200" style={{ aspectRatio: '1' }}>
                    <Scanner
                      onScan={handleScanResult}
                      onError={(error) => {
                        console.error('QR Scanner Error:', error);
                        toast({
                          title: "Scanner Error",
                          description: 'QR scanner encountered an error. Please try again.',
                          variant: "destructive",
                        });
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      QR Scanner Active
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={simulateQRScan}
                      variant="outline"
                      className="w-full border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Simulate Scan
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="w-full border-2 border-red-200 hover:bg-red-50 hover:border-red-400 transition-all duration-300"
                    >
                      <CameraOff className="w-4 h-4 mr-2" />
                      Stop Scanner
                    </Button>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-xs text-indigo-700 text-center">
                      Point camera at QR code or use simulate button for testing
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium mb-2">QR Scanner Ready</p>
                    <p className="text-sm text-gray-500">Click below to start scanning</p>
                  </div>
                  <Button
                    onClick={startCamera}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg text-white py-6"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Start QR Scanner
                  </Button>
                </div>
              )}

              {/* Manual Entry */}
              <div className="border-t-2 border-gray-100 pt-6">
                <label htmlFor="qrData" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  Or Enter QR Code Data Manually
                </label>
                <div className="space-y-3">
                  <Input
                    id="qrData"
                    type="text"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    placeholder="Enter QR code data or paste QR content"
                    className="w-full border-2 border-gray-200 focus:border-indigo-400 transition-colors"
                  />
                  <Button
                    onClick={() => handleValidateQR()}
                    disabled={isLoading || !qrData.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoading ? 'Validating...' : 'Validate QR Code'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Status Section */}
          <Card className="border-0 shadow-2xl bg-white">
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 border-b">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Mark Ticket as Used</CardTitle>
                  <CardDescription>
                    Mark validated tickets as used after event check-in
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {validationResult && (
                <div className="mb-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-green-800">Validated Ticket</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-green-200">
                      <span className="text-sm font-medium text-gray-700">Ticket ID:</span>
                      <span className="text-sm font-mono bg-white px-3 py-1 rounded-md shadow-sm">{validationResult.ticket.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-green-200">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <Badge className={`${
                        validationResult.ticket.status === 'active'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      } shadow-sm`}>
                        {validationResult.ticket.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-green-200">
                      <span className="text-sm font-medium text-gray-700">Event:</span>
                      <span className="text-sm font-semibold text-gray-900">{validationResult.ticket.ticketType?.event?.title || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-700">Can Check In:</span>
                      {validationResult.canCheckIn ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm">
                          <XCircle className="w-3 h-3 mr-1" />
                          No
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="ticketId" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  Ticket ID (if not showing above)
                </label>
                <Input
                  id="ticketId"
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter ticket ID manually"
                  className="w-full border-2 border-gray-200 focus:border-emerald-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleMarkAsUsed}
                  disabled={isLoading || !validationResult}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Mark as Used'}
                </Button>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}