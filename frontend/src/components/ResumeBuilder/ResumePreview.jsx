import React from 'react';
import ModernTemplate from './Templates/ModernTemplate';
import ATSTemplate from './Templates/ATSTemplate';
import ExecutiveTemplate from './Templates/ExecutiveTemplate';
import MinimalistTemplate from './Templates/MinimalistTemplate';
import CreativeTemplate from './Templates/CreativeTemplate';
import StudentTemplate from './Templates/StudentTemplate';

const ResumePreview = React.forwardRef(({ data, template }, ref) => {
  const renderTemplate = () => {
    switch (template) {
      case 'ats':
        return <ATSTemplate data={data} />;
      case 'executive':
        return <ExecutiveTemplate data={data} />;
      case 'minimalist':
        return <MinimalistTemplate data={data} />;
      case 'creative':
        return <CreativeTemplate data={data} />;
      case 'student':
        return <StudentTemplate data={data} />;
      case 'modern':
      default:
        return <ModernTemplate data={data} />;
    }
  };

  return (
    <div ref={ref} className="bg-white resume-force-light">
      {renderTemplate()}
    </div>
  );
});

export default ResumePreview;
