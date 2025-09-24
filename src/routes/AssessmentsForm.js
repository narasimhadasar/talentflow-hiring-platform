import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function generateZodSchema(schema) {
  const fields = {};
  schema.sections.forEach(section => {
    section.questions.forEach(q => {
      let fieldSchema;
      switch (q.type) {
        case 'single-choice':
          fieldSchema = z.enum(q.options || []);
          break;
        case 'multi-choice':
          fieldSchema = z.array(z.enum(q.options || [])).min(q.required ? 1 : 0, 'Required');
          break;
        case 'short-text':
        case 'long-text':
          fieldSchema = z.string().max(q.maxLength || Infinity);
          break;
        case 'numeric':
          fieldSchema = z.number().min(q.min ?? -Infinity).max(q.max ?? Infinity);
          break;
        case 'file-upload':
          fieldSchema = z.any();
          break;
        default:
          fieldSchema = z.any();
      }
      if (q.required && q.type !== 'multi-choice') {
        fieldSchema = fieldSchema.refine(val => val != null && val !== '', 'Required');
      }
      fields[q.id] = fieldSchema;
    });
  });
  return z.object(fields);
}

export default function AssessmentForm({ schema, preview = false, jobId, applicationId }) {
  const { control, register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(generateZodSchema(schema)),
  });
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    if (!preview && applicationId) {
      axios.get(`/api/assignments?applicationId=${applicationId}`)
        .then(res => {
          let assign = res.data[0];
          if (!assign) {
            // Create new
            axios.post(`/api/assignments`, { applicationId, assessmentId: schema.id, status: 'Not Started', answers: {} })
              .then(newRes => {
                assign = newRes.data;
                setAssignment(assign);
                reset(assign.answers);
              });
          } else {
            setAssignment(assign);
            reset(assign.answers);
          }
        });
    }
  }, [preview, applicationId, reset, schema.id]);

  const onSubmit = (data) => {
    if (!preview && assignment) {
      axios.patch(`/api/assignments/${assignment.id}`, { answers: data, status: 'Submitted' })
        .then(() => console.log('Submitted'))
        .catch(err => console.error('Submit failed', err));
    }
  };

  const renderQuestion = (q) => {
    const conditionalMet = q.conditional ? watch(q.conditional.qId) === q.conditional.value : true;
    if (!conditionalMet) return null;

    switch (q.type) {
      case 'single-choice':
        return (
          <div>
            {q.options.map(opt => (
              <label key={opt}>
                <input type="radio" value={opt} {...register(q.id)} disabled={preview} />
                {opt}
              </label>
            ))}
          </div>
        );
      case 'multi-choice':
        return (
          <Controller
            name={q.id}
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <div>
                {q.options.map(opt => (
                  <label key={opt}>
                    <input
                      type="checkbox"
                      checked={field.value.includes(opt)}
                      onChange={e => {
                        const updated = e.target.checked
                          ? [...field.value, opt]
                          : field.value.filter(v => v !== opt);
                        field.onChange(updated);
                      }}
                      disabled={preview}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}
          />
        );
      case 'short-text':
        return <input {...register(q.id)} disabled={preview} />;
      case 'long-text':
        return <textarea {...register(q.id)} disabled={preview} />;
      case 'numeric':
        return <input type="number" {...register(q.id, { valueAsNumber: true })} disabled={preview} />;
      case 'file-upload':
        return <input type="file" {...register(q.id)} disabled={preview} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>{schema.title}</h2>
      {schema.sections.map((section, sIdx) => (
        <div key={sIdx}>
          <h3>{section.title}</h3>
          {section.questions.map(q => (
            <div key={q.id}>
              <label>{q.label} {q.required && '*'}</label>
              {renderQuestion(q)}
              {errors[q.id] && <span style={{ color: 'red' }}>{errors[q.id].message}</span>}
            </div>
          ))}
        </div>
      ))}
      {!preview && <button type="submit">Submit</button>}
    </form>
  );
}