import React, { useState, useEffect, useMemo } from 'react';
import { Container, Card, CardBody, Row, Col, Table, Spinner, Alert, Button, Input, Label, FormGroup, Badge, Collapse, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import axiosApi from '../../helpers/api_helper';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { GET_IMAM_DETAILS_REPORT } from '../../helpers/url_helper';

const ImamDetailsReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [groupBy, setGroupBy] = useState('');
    const [showGroupBy, setShowGroupBy] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axiosApi.get(GET_IMAM_DETAILS_REPORT, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setData(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch data');
            }
        } catch (err) {
            console.error('Error fetching imam details:', err);
            setError(err.response?.data?.message || 'Error fetching imam details');
        } finally {
            setLoading(false);
        }
    };

    const processedData = useMemo(() => {
        let result = [...data];
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.name?.toLowerCase().includes(searchLower) ||
                item.surname?.toLowerCase().includes(searchLower) ||
                item.email?.toLowerCase().includes(searchLower) ||
                item.id_number?.toLowerCase().includes(searchLower) ||
                item.cell_number?.toLowerCase().includes(searchLower) ||
                item.title_name?.toLowerCase().includes(searchLower) ||
                item.nationality_name?.toLowerCase().includes(searchLower)
            );
        }
        if (sortConfig.key) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [data, searchTerm, sortConfig]);

    const groupedData = useMemo(() => {
        if (!groupBy) return null;
        const grouped = {};
        processedData.forEach(item => {
            const key = item[groupBy] || 'Not Specified';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
        });
        return grouped;
    }, [processedData, groupBy]);

    const paginatedData = useMemo(() => {
        if (groupBy) return processedData;
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedData.slice(startIndex, startIndex + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage, groupBy]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Surname', 'Email', 'ID Number', 'Cell Number', 'Title', 'Nationality', 'DOB', 'Created By', 'Created At'];
        const csvData = processedData.map(item => [
            item.name || '', item.surname || '', item.email || '', item.id_number || '',
            item.cell_number || '', item.title_name || '', item.nationality_name || '',
            formatDate(item.dob), item.created_by || '', formatDate(item.created_at)
        ]);
        const csvContent = [headers.join(','), ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `imam_details_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setGroupBy('');
        setSortConfig({ key: null, direction: 'asc' });
        setShowGroupBy(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <i className="bx bx-sort text-muted"></i>;
        return sortConfig.direction === 'asc' ? 
            <i className="bx bx-sort-up text-primary"></i> : 
            <i className="bx bx-sort-down text-primary"></i>;
    };

    if (loading) {
        return (
            <div className="page-content">
                <div className="container-fluid">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <Spinner color="primary" className="me-2" />
                        <span>Loading imam details report...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content">
                <div className="container-fluid">
                    <Alert color="danger">
                        <h5>Error Loading Report</h5>
                        <p>{error}</p>
                        <Button color="primary" onClick={fetchData}>Retry</Button>
                    </Alert>
                </div>
            </div>
        );
    }

    document.title = "Imam Details Report | IDP";

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Reports" breadcrumbItem="Imam Details Report" />
                <Row>
                    <Col lg={12}>
                        <Card>
                            <CardBody>
                                <Row className="mb-3">
                                    <Col sm={6}>
                                        <h4 className="card-title mb-0">
                                            <i className="bx bx-user me-2"></i>
                                            Imam Details Report
                                        </h4>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="text-sm-end">
                                            <UncontrolledDropdown className="d-inline-block">
                                                <DropdownToggle color="primary" caret style={{ borderRadius: 0 }}>
                                                    <i className="bx bx-cog me-1"></i>
                                                    Actions
                                                </DropdownToggle>
                                                <DropdownMenu end>
                                                    <DropdownItem header>Report Functions</DropdownItem>
                                                    <DropdownItem onClick={exportToCSV}>
                                                        <i className="bx bx-download me-2"></i>
                                                        Export to CSV
                                                    </DropdownItem>
                                                    <DropdownItem divider />
                                                    <DropdownItem header>Filters & Grouping</DropdownItem>
                                                    <DropdownItem onClick={() => setShowGroupBy(!showGroupBy)}>
                                                        <i className="bx bx-group me-2"></i>
                                                        {showGroupBy ? 'Hide' : 'Show'} Group By
                                                        {groupBy && <Badge color="success" className="ms-1">Active</Badge>}
                                                    </DropdownItem>
                                                    <DropdownItem divider />
                                                    <DropdownItem onClick={clearFilters}>
                                                        <i className="bx bx-reset me-2"></i>
                                                        Clear All Filters
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </UncontrolledDropdown>
                                        </div>
                                    </Col>
                                </Row>

                                <Collapse isOpen={showGroupBy}>
                                    <div className="border p-3 mb-3 bg-light">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0">
                                                <i className="bx bx-group me-2"></i>
                                                Group By Options
                                            </h6>
                                            <Button color="light" size="sm" onClick={() => setShowGroupBy(false)}>
                                                <i className="bx bx-x"></i>
                                            </Button>
                                        </div>
                                        <Row>
                                            <Col md={6}>
                                                <FormGroup>
                                                    <Label>Group By (Control Break)</Label>
                                                    <Input type="select" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                                                        <option value="">No Grouping</option>
                                                        <option value="title_name">Title</option>
                                                        <option value="nationality_name">Nationality</option>
                                                        <option value="status_name">Status</option>
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </div>
                                </Collapse>

                                {!loading && !error && data.length > 0 && (
                                    <Row className="mb-2">
                                        <Col sm={2}>
                                            <select className="form-select pageSize mb-2" value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                                                {[10, 20, 30, 40, 50].map(pageSize => (
                                                    <option key={pageSize} value={pageSize}>Show {pageSize}</option>
                                                ))}
                                            </select>
                                        </Col>
                                        <Col sm={4}>
                                            <Input type="text" className="form-control search-box me-2 mb-2 d-inline-block" placeholder="Search Imam Details..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </Col>
                                    </Row>
                                )}

                                {!loading && !error && data.length === 0 && (
                                    <div className="alert alert-info" role="alert">
                                        <i className="bx bx-info-circle me-2"></i>
                                        No imam data found.
                                    </div>
                                )}

                                {!loading && !error && data.length > 0 && (
                                    <>
                                        {groupBy && groupedData ? (
                                            Object.entries(groupedData).map(([groupKey, groupItems]) => (
                                                <div key={groupKey} className="mb-4">
                                                    <div className="bg-primary bg-soft p-3 mb-2 rounded">
                                                        <h5 className="mb-0">
                                                            <i className="bx bx-group me-2"></i>
                                                            {groupKey} <Badge color="primary" className="ms-2">{groupItems.length} records</Badge>
                                                        </h5>
                                                    </div>
                                                    <div className="table-responsive" style={{ maxHeight: '600px', overflowX: 'auto', overflowY: 'auto' }}>
                                                        <Table hover className="table-bordered table-nowrap table-sm">
                                                            <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                                                <tr>
                                                                    <th style={{cursor: 'pointer'}} onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
                                                                    <th style={{cursor: 'pointer'}} onClick={() => handleSort('surname')}>Surname {getSortIcon('surname')}</th>
                                                                    <th>Email</th>
                                                                    <th>ID Number</th>
                                                                    <th>Cell Number</th>
                                                                    <th>Title</th>
                                                                    <th>Nationality</th>
                                                                    <th>DOB</th>
                                                                    <th>Created By</th>
                                                                    <th>Created At</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {groupItems.map((item) => (
                                                                    <tr key={item.id}>
                                                                        <td>{item.name || '-'}</td>
                                                                        <td>{item.surname || '-'}</td>
                                                                        <td><small>{item.email || '-'}</small></td>
                                                                        <td>{item.id_number || '-'}</td>
                                                                        <td>{item.cell_number || '-'}</td>
                                                                        <td>{item.title_name || '-'}</td>
                                                                        <td>{item.nationality_name || '-'}</td>
                                                                        <td>{formatDate(item.dob)}</td>
                                                                        <td>{item.created_by || '-'}</td>
                                                                        <td>{formatDate(item.created_at)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="table-responsive" style={{ maxHeight: '600px', overflowX: 'auto', overflowY: 'auto' }}>
                                                <Table hover className="table-bordered table-nowrap">
                                                    <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                                        <tr>
                                                            <th style={{cursor: 'pointer'}} onClick={() => handleSort('name')}>Name {getSortIcon('name')}</th>
                                                            <th style={{cursor: 'pointer'}} onClick={() => handleSort('surname')}>Surname {getSortIcon('surname')}</th>
                                                            <th>Email</th>
                                                            <th>ID Number</th>
                                                            <th>Cell Number</th>
                                                            <th>Title</th>
                                                            <th>Nationality</th>
                                                            <th>DOB</th>
                                                            <th>Created By</th>
                                                            <th>Created At</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedData.map((item) => (
                                                            <tr key={item.id}>
                                                                <td>{item.name || '-'}</td>
                                                                <td>{item.surname || '-'}</td>
                                                                <td><small>{item.email || '-'}</small></td>
                                                                <td>{item.id_number || '-'}</td>
                                                                <td>{item.cell_number || '-'}</td>
                                                                <td>{item.title_name || '-'}</td>
                                                                <td>{item.nationality_name || '-'}</td>
                                                                <td>{formatDate(item.dob)}</td>
                                                                <td>{item.created_by || '-'}</td>
                                                                <td>{formatDate(item.created_at)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}

                                        {!groupBy && processedData.length > 0 && (
                                            <Row className="mt-3">
                                                <Col sm={12} md={5}>
                                                    <div className="dataTables_info">
                                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} Results
                                                    </div>
                                                </Col>
                                                <Col sm={12} md={7}>
                                                    <div className="dataTables_paginate paging_simple_numbers float-end">
                                                        <ul className="pagination pagination-rounded mb-0">
                                                            <li className={`paginate_button page-item previous ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                <Link to="#" className="page-link" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>
                                                                    <i className="mdi mdi-chevron-left"></i>
                                                                </Link>
                                                            </li>
                                                            {[...Array(totalPages)].map((_, i) => {
                                                                const pageNum = i + 1;
                                                                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                                                    return (
                                                                        <li key={pageNum} className={`paginate_button page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                                            <Link to="#" className="page-link" onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}>
                                                                                {pageNum}
                                                                            </Link>
                                                                        </li>
                                                                    );
                                                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                                    return <li key={pageNum} className="paginate_button page-item disabled"><span className="page-link">...</span></li>;
                                                                }
                                                                return null;
                                                            })}
                                                            <li className={`paginate_button page-item next ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                                <Link to="#" className="page-link" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>
                                                                    <i className="mdi mdi-chevron-right"></i>
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </Col>
                                            </Row>
                                        )}
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ImamDetailsReport;

