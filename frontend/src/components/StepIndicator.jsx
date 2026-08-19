import React from 'react';
import classNames from 'classnames';
import { Check } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > index;
        const isActive = currentStep === index;
        
        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center relative">
              <div 
                className={classNames(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold z-10 transition-colors duration-300",
                  isCompleted ? "bg-blue-600 text-white" : 
                  isActive ? "bg-blue-100 text-blue-600 border-2 border-blue-600" : 
                  "bg-surface-hover text-content-muted border border-border-default"
                )}
              >
                {isCompleted ? <Check size={20} /> : index + 1}
              </div>
              <span 
                className={classNames(
                  "absolute -bottom-6 text-sm font-medium whitespace-nowrap",
                  isActive || isCompleted ? "text-content" : "text-content-muted"
                )}
              >
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 bg-surface-hover mt-[-24px]">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: isCompleted ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
