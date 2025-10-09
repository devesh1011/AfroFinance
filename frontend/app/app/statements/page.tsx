import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  FileText, 
  Download, 
  Search, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Eye,
  Mail,
  RefreshCw
} from 'lucide-react'

export default function StatementsPage() {
  const monthlyStatements = [
    {
      period: "January 2024",
      type: "Monthly Statement",
      date: "2024-02-01",
      size: "2.4 MB",
      status: "Available",
      url: "/statements/2024-01.pdf"
    },
    {
      period: "December 2023",
      type: "Monthly Statement", 
      date: "2024-01-01",
      size: "2.1 MB",
      status: "Available",
      url: "/statements/2023-12.pdf"
    },
    {
      period: "November 2023",
      type: "Monthly Statement",
      date: "2023-12-01", 
      size: "1.9 MB",
      status: "Available",
      url: "/statements/2023-11.pdf"
    }
  ]

  const tradeConfirmations = [
    {
      id: "T-2024-001",
      symbol: "AAPL",
      type: "BUY",
      quantity: 10,
      price: 189.50,
      date: "2024-01-15",
      status: "Confirmed",
      total: 1895.00
    },
    {
      id: "T-2024-002", 
      symbol: "TSLA",
      type: "SELL",
      quantity: 5,
      price: 245.30,
      date: "2024-01-14",
      status: "Confirmed",
      total: 1226.50
    },
    {
      id: "T-2024-003",
      symbol: "MSFT", 
      type: "BUY",
      quantity: 5,
      price: 420.75,
      date: "2024-01-12",
      status: "Confirmed",
      total: 2103.75
    }
  ]

  const taxDocuments = [
    {
      year: "2023",
      type: "1099-B Form",
      description: "Proceeds from Broker and Barter Exchange Transactions",
      status: "Available",
      date: "2024-01-31",
      url: "/tax/1099b-2023.pdf"
    },
    {
      year: "2023",
      type: "Year-End Summary",
      description: "Annual Portfolio Summary and Tax Information",
      status: "Available", 
      date: "2024-01-15",
      url: "/tax/summary-2023.pdf"
    },
    {
      year: "2022",
      type: "1099-B Form",
      description: "Proceeds from Broker and Barter Exchange Transactions",
      status: "Available",
      date: "2023-01-31",
      url: "/tax/1099b-2022.pdf"
    }
  ]

  const legalDocuments = [
    {
      title: "Account Agreement",
      description: "Terms and conditions for your brokerage account",
      lastUpdated: "2023-12-01",
      version: "v3.2",
      url: "/legal/account-agreement.pdf"
    },
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your personal information",
      lastUpdated: "2023-11-15",
      version: "v2.1",
      url: "/legal/privacy-policy.pdf"
    },
    {
      title: "Risk Disclosure",
      description: "Important information about investment risks",
      lastUpdated: "2023-10-01",
      version: "v1.8",
      url: "/legal/risk-disclosure.pdf"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statements & Documents</h1>
          <p className="text-gray-600">Access your account statements, trade confirmations, and legal documents</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Statements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStatements.length}</div>
            <p className="text-xs text-muted-foreground">Monthly reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trade Confirmations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tradeConfirmations.length}</div>
            <p className="text-xs text-muted-foreground">Recent trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Documents</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxDocuments.length}</div>
            <p className="text-xs text-muted-foreground">Available forms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-xs text-muted-foreground">2 hours ago</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="statements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="trades">Trade Confirmations</TabsTrigger>
          <TabsTrigger value="tax">Tax Documents</TabsTrigger>
          <TabsTrigger value="legal">Legal Documents</TabsTrigger>
        </TabsList>

        {/* Monthly Statements */}
        <TabsContent value="statements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Statements</CardTitle>
                  <CardDescription>Your account activity summaries by month</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search statements..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyStatements.map((statement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{statement.period}</h3>
                        <p className="text-sm text-gray-600">{statement.type}</p>
                        <p className="text-xs text-gray-500">Generated on {new Date(statement.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">{statement.status}</Badge>
                        <p className="text-sm text-gray-600">{statement.size}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trade Confirmations */}
        <TabsContent value="trades" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trade Confirmations</CardTitle>
                  <CardDescription>Confirmations for your recent transactions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input type="date" className="w-40" />
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tradeConfirmations.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${trade.type === 'BUY' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {trade.type === 'BUY' ? 
                          <TrendingUp className={`h-6 w-6 text-green-600`} /> :
                          <TrendingDown className={`h-6 w-6 text-red-600`} />
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold">{trade.id}</h3>
                        <p className="text-sm text-gray-600">{trade.type} {trade.quantity} shares of {trade.symbol}</p>
                        <p className="text-xs text-gray-500">{new Date(trade.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">${trade.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">@ ${trade.price}</p>
                        <Badge variant="secondary" className="text-xs">{trade.status}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Documents */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tax Documents</CardTitle>
                  <CardDescription>Tax forms and year-end summaries</CardDescription>
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border rounded-md">
                    <option value="">All Years</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.type} - {doc.year}</h3>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                        <p className="text-xs text-gray-500">Available since {new Date(doc.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{doc.status}</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Documents */}
        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents</CardTitle>
              <CardDescription>Important account agreements and disclosures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {legalDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.title}</h3>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(doc.lastUpdated).toLocaleDateString()} • {doc.version}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
