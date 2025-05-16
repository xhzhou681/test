import React, { useState, useEffect } from 'react';
import { Form, Button, FormControl, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';

const SearchForm = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const typeaheadRef = React.useRef(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/ksmc');
        const formattedDepartments = response.data.map(dept => ({ label: dept }));
        setDepartments(formattedDepartments);
        console.log("!!!!!!!", formattedDepartments);
      } catch (err) {
        const defaultDepts = [
          { label: '急诊护理组' },
          { label: '外科' },
          { label: '妇科' },
          { label: '儿科' }
        ];
        setDepartments(defaultDepts);
        console.error('科室接口异常，使用默认数据:', err);
      }
    };
    
    fetchDepartments();
  }, []);

  const handleSearch = async () => {
    if (!query || query.length > 200) {
      setError('查询内容不能为空且不超过200字');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post('/api/mxb', {
        query,
        ksmc: selectedDepartment[0]?.label || ''
      });
      setResult(response.data.join('\n'));
      setError('');
    } catch (err) {
      setError('查询失败，请稍后重试');
      console.error('API调用错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setResult('');
    setError('');
    setSelectedDepartment([]);
    typeaheadRef.current.clear();
  };

  return (
    <div className="p-4">
      <Form className="mb-4">
        <div className="mb-3">
          <Typeahead
            ref={typeaheadRef}
            id="department-select"
            options={departments}
            placeholder="选择或输入科室"
            filterBy={(option, props) => option.label.toLowerCase().includes(props.text.toLowerCase())}
            minLength={1}
            onChange={(selected) => setSelectedDepartment(selected)}
            selected={selectedDepartment}
            labelKey="label"
          />
        </div>

        <FormControl
          as="textarea"
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="请输入查询内容（最多200字）"
          maxLength={200}
          className="mb-3"
        />

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="d-grid gap-2 d-md-block">
          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={isLoading}
            className="me-2"
          >
            {isLoading ? '查询中...' : '开始查询'}
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            取消
          </Button>
        </div>
      </Form>

      {result && (
        <FormControl
          as="textarea"
          rows={8}
          value={result}
          readOnly
          className="mt-3"
        />
      )}
    </div>
  );
};

export default SearchForm;