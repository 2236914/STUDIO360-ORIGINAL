'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Upload } from 'src/components/upload';

// ----------------------------------------------------------------------

const steps = [
  {
    label: 'Data Input',
    description: 'Upload receipts, sales data, or Excel files',
    icon: 'eva:file-add-fill',
    content: {
      title: 'Upload Your Documents',
      description: 'Upload receipts, sales Excel files, or connect to e-commerce platforms',
      mockData: {
        files: [
          { name: 'receipt_001.jpg', type: 'Receipt', size: '2.3 MB' },
          { name: 'sales_data.xlsx', type: 'Excel', size: '1.8 MB' },
          { name: 'shopee_orders.csv', type: 'CSV', size: '0.9 MB' },
        ],
        platforms: ['Shopee', 'TikTok', 'Lazada']
      }
    }
  },
  {
    label: 'AI Recognition',
    description: 'AI processes and recognizes text from documents',
    icon: 'eva:smartphone-fill',
    content: {
      title: 'AI Text Recognition in Progress',
      description: 'Our AI is analyzing your documents and extracting transaction data',
      mockData: {
        progress: 75,
        extractedItems: [
          { text: 'Shopee Order #SP12345', confidence: 98, category: 'Online Sales' },
          { text: 'Phone Case Purchase', confidence: 95, category: 'Cost of Goods' },
          { text: 'Marketing Campaign', confidence: 87, category: 'Marketing Expenses' },
          { text: 'Office Supplies', confidence: 92, category: 'Operating Expenses' },
        ]
      }
    }
  },
  {
    label: 'User Confirmation',
    description: 'Review and confirm AI categorization results',
    icon: 'eva:checkmark-circle-2-fill',
    content: {
      title: 'Review AI Categorization',
      description: 'Please review and confirm the AI-categorized transactions',
      mockData: {
        transactions: [
          {
            id: 1,
            description: 'Shopee Order #SP12345-Phone Case',
            amount: 850,
            aiCategory: 'Online Sales Revenue',
            confidence: 98,
            suggested: true
          },
          {
            id: 2,
            description: 'Phone Case Inventory Purchase',
            amount: 300,
            aiCategory: 'Cost of Goods Sold',
            confidence: 95,
            suggested: true
          },
          {
            id: 3,
            description: 'Facebook Ads Campaign',
            amount: 1500,
            aiCategory: 'Marketing Expenses',
            confidence: 87,
            suggested: false
          },
          {
            id: 4,
            description: 'Office Supplies - Paper & Ink',
            amount: 250,
            aiCategory: 'Operating Expenses',
            confidence: 92,
            suggested: true
          }
        ]
      }
    }
  },
  {
    label: 'Data Transfer',
    description: 'Transfer confirmed data to book of accounts',
    icon: 'eva:arrow-forward-fill',
    content: {
      title: 'Transfer to Book of Accounts',
      description: 'Transferring confirmed transactions to your bookkeeping system',
      mockData: {
        transferred: 4,
        total: 4,
        categories: ['Online Sales Revenue', 'Cost of Goods Sold', 'Marketing Expenses', 'Operating Expenses']
      }
    }
  }
];

const CATEGORY_OPTIONS = [
  'Online Sales Revenue',
  'Walk-in Sales',
  'Cost of Goods Sold',
  'Marketing Expenses',
  'Operating Expenses',
  'Platform Fees',
  'Rent Expense',
  'Utilities',
  'Insurance',
  'Office Supplies',
  'Equipment',
  'Advertising',
  'Travel Expenses',
  'Professional Fees',
  'Other Income',
  'Other Expenses'
];

export default function UploadProcessPage() {
  useEffect(() => {
    document.title = 'AI Bookkeeping Process | Kitsch Studio';
  }, []);

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState(steps[2].content.mockData.transactions);
  const [editDialog, setEditDialog] = useState({ open: false, transaction: null });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const totalSteps = steps.length;
  const completedSteps = Object.keys(completed).length;
  const allStepsCompleted = completedSteps === totalSteps;

  const handleNext = () => {
    setProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      const newCompleted = completed;
      newCompleted[activeStep] = true;
      setCompleted(newCompleted);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setProcessing(false);
    }, 2000);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
    setUploadedFiles([]);
  };

  const handleEditTransaction = (transaction) => {
    setEditDialog({ open: true, transaction: { ...transaction } });
  };

  const handleSaveEdit = () => {
    if (editDialog.transaction) {
      setTransactions(prev => 
        prev.map(t => 
          t.id === editDialog.transaction.id ? editDialog.transaction : t
        )
      );
    }
    setEditDialog({ open: false, transaction: null });
  };

  const handleCancelEdit = () => {
    setEditDialog({ open: false, transaction: null });
  };

  const handleDropFiles = (acceptedFiles) => {
    setUploadedFiles(acceptedFiles);
  };

  const handleRemoveFile = (fileToRemove) => {
    setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleRemoveAllFiles = () => {
    setUploadedFiles([]);
  };

  const renderStepContent = (step, stepIndex) => {
    if (!step || !step.content) {
      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Step not found
          </Typography>
        </Box>
      );
    }

    const { content } = step;
    
    switch (stepIndex) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {content.description}
            </Typography>
            
            <Stack spacing={3}>
              <Alert severity="info">
                Supported formats: JPG, PNG, PDF, Excel (.xlsx), CSV
              </Alert>
              
              {/* File Upload Dropzone */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Upload Files:
                </Typography>
                <Upload
                  multiple
                  value={uploadedFiles}
                  onDrop={handleDropFiles}
                  onRemove={handleRemoveFile}
                  onRemoveAll={handleRemoveAllFiles}
                  accept={{
                    'image/*': ['.jpeg', '.jpg', '.png'],
                    'application/pdf': ['.pdf'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/vnd.ms-excel': ['.xls'],
                    'text/csv': ['.csv'],
                  }}
                  helperText="Drop files here or click to browse. Supported: JPG, PNG, PDF, Excel, CSV"
                />
              </Box>
              
              {/* Connected Platforms */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Connected Platforms:
                </Typography>
                <Stack direction="row" spacing={1}>
                  {content.mockData.platforms.map((platform) => (
                    <Chip key={platform} label={platform} variant="outlined" />
                  ))}
                </Stack>
              </Box>

              {/* Sample Files (for demo) */}
              {uploadedFiles.length === 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Sample Files (Demo):
                  </Typography>
                  <Stack spacing={1}>
                    {content.mockData.files.map((file, index) => (
                      <Card key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Iconify icon="eva:file-fill" width={20} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {file.type} • {file.size}
                            </Typography>
                          </Box>
                          <Chip label="Sample" color="info" size="small" />
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {content.description}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Processing Progress</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {content.mockData.progress}%
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={content.mockData.progress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Extracted Items:
            </Typography>
            <Stack spacing={1}>
              {content.mockData.extractedItems.map((item, index) => (
                <Card key={index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.text}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Suggested: {item.category}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${item.confidence}%`} 
                      color={item.confidence >= 90 ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {content.description}
            </Typography>
            
            <Stack spacing={2}>
              {transactions.map((transaction) => (
                <Card key={transaction.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {transaction.description}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        ₱{transaction.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        AI Category: {transaction.aiCategory}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={`${transaction.confidence}%`} 
                        color={transaction.confidence >= 90 ? 'success' : 'warning'} 
                        size="small" 
                      />
                      {transaction.suggested ? (
                        <Chip label="Suggested" color="success" size="small" />
                      ) : (
                        <Chip label="Review" color="warning" size="small" />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleEditTransaction(transaction)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Iconify icon="eva:edit-fill" width={16} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Click the edit icon to modify any AI categorization if it's not accurate
            </Alert>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {content.description}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Transfer Progress</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {content.mockData.transferred}/{content.mockData.total} completed
                </Typography>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={(content.mockData.transferred / content.mockData.total) * 100} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Transferred Categories:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {content.mockData.categories.map((category) => (
                <Chip key={category} label={category} color="success" />
              ))}
            </Stack>
            
            <Alert severity="success" sx={{ mt: 2 }}>
              All transactions have been successfully transferred to your Book of Accounts!
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1 }}>
        AI Bookkeeping Process
      </Typography>
      
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Dashboard / AI Bookkeeper / Upload Process
      </Typography>

      {/* Progress Overview */}
      <Card sx={{ p: 3, mb: 3, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
              Process Progress
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Step {activeStep + 1} of {totalSteps} • {completedSteps} completed
            </Typography>
          </Box>
          <Chip 
            label={`${Math.round((completedSteps / totalSteps) * 100)}% Complete`} 
            color="primary" 
            variant="filled"
          />
        </Stack>
      </Card>

      {/* Stepper */}
      <Card sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="horizontal">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: completed[index] ? 'success.main' : 'grey.300',
                      color: completed[index] ? 'white' : 'text.primary',
                    }}
                  >
                    {completed[index] ? (
                      <Iconify icon="eva:checkmark-fill" width={20} />
                    ) : (
                      <Iconify icon={step.icon} width={20} />
                    )}
                  </Box>
                )}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {step.description}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mt: 4 }}>
          {renderStepContent(steps[activeStep], activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back
          </Button>
          
          <Box>
            {allStepsCompleted ? (
              <Button
                variant="contained"
                onClick={handleReset}
                startIcon={<Iconify icon="eva:refresh-fill" />}
              >
                Start Over
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={processing}
                startIcon={processing ? <Iconify icon="eva:loader-fill" /> : <Iconify icon="eva:arrow-forward-fill" />}
              >
                {processing ? 'Processing...' : activeStep === totalSteps - 1 ? 'Finish' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={editDialog.open} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Transaction Categorization</DialogTitle>
        <DialogContent>
          {editDialog.transaction && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  value={editDialog.transaction.description}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    transaction: { ...prev.transaction, description: e.target.value }
                  }))}
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Amount
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={editDialog.transaction.amount}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    transaction: { ...prev.transaction, amount: parseFloat(e.target.value) || 0 }
                  }))}
                  InputProps={{
                    startAdornment: <Typography variant="body2">₱</Typography>,
                  }}
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Category
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={editDialog.transaction.aiCategory}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    transaction: { ...prev.transaction, aiCategory: e.target.value }
                  }))}
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Confidence Level
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={editDialog.transaction.confidence}
                  onChange={(e) => setEditDialog(prev => ({
                    ...prev,
                    transaction: { ...prev.transaction, confidence: parseInt(e.target.value) || 0 }
                  }))}
                  InputProps={{
                    endAdornment: <Typography variant="body2">%</Typography>,
                  }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
} 