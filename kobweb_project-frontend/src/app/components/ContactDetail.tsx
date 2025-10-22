
'use client';

import { useState } from 'react';
import { useDeleteContact } from '../hooks/useApi';
import BusinessCardEditor from './BusinessCardEditor';

interface Contact {
  businessCardId?: string;
  id?: string;
  name: string;
  position?: string;
  title?: string;
  avatar?: string;
  email: string;
  company?: string;
  github?: string;
  notion?: string;
  skills?: string[];
}

interface ContactDetailProps {
  contact: Contact | null;
  onContactUpdated?: () => void;
}

export default function ContactDetail({ contact, onContactUpdated }: ContactDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteContact, loading: deleteLoading, error: deleteError } = useDeleteContact();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedContact: Contact) => {
    setIsEditing(false);
    if (onContactUpdated) {
      onContactUpdated();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const contactId = contact?.businessCardId || contact?.id;
    if (!contactId) return;

    try {
      await deleteContact(contactId);
      setShowDeleteConfirm(false);
      if (onContactUpdated) {
        onContactUpdated();
      }
    } catch (error) {
      console.error('명함 삭제 실패:', error);
    }
  };

  if (!contact) {
    return (
      <div className="bg-white border-2 border-slate-400 rounded-lg h-full flex flex-col items-center justify-center text-center p-12 shadow-md">
        <div className="w-20 h-20 bg-slate-300 rounded-full flex items-center justify-center mb-4 shadow-lg border-2 border-slate-400">
          <i className="ri-user-line w-10 h-10 text-slate-600 flex items-center justify-center"></i>
        </div>
        <h3 className="text-[#1E2022] font-semibold mb-2">연락처를 선택해주세요</h3>
        <p className="text-slate-700 text-sm max-w-xs font-medium">왼쪽 목록에서 연락처를 선택하면 상세 정보를 확인할 수 있습니다.</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-slate-400 rounded-lg h-full shadow-md">
        <BusinessCardEditor
          businessCard={contact}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-6 h-full shadow-md">
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-400 flex-shrink-0 flex items-center justify-center shadow-lg border-2 border-slate-500">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <i className="ri-user-line text-[#52616B] text-2xl"></i>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#1E2022] mb-1">{contact.name}</h2>
          <p className="text-[#52616B] text-lg mb-2">{contact.position || contact.title || '직책 미등록'}</p>
          {contact.company && (
            <p className="text-[#52616B] text-base mb-4">{contact.company}</p>
          )}

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <i className="ri-mail-line w-5 h-5 text-[#52616B] flex items-center justify-center"></i>
              <span className="text-[#52616B]">{contact.email}</span>
            </div>
            {contact.github && (
              <div className="flex items-center space-x-3">
                <i className="ri-github-fill w-5 h-5 text-[#52616B] flex items-center justify-center"></i>
                <span className="text-[#52616B]">{contact.github}</span>
              </div>
            )}
            {contact.notion && (
              <div className="flex items-center space-x-3">
                <i className="ri-notion-fill w-5 h-5 text-[#52616B] flex items-center justify-center"></i>
                <span className="text-[#52616B]">{contact.notion}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="bg-[#34373b] hover:bg-[#1E2022] text-[#F0F5F9] px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="편집"
          >
            <i className="ri-edit-line w-4 h-4 flex items-center justify-center"></i>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="삭제"
          >
            <i className="ri-delete-bin-line w-4 h-4 flex items-center justify-center"></i>
          </button>
        </div>
      </div>
      
      {contact.skills && contact.skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[#1E2022] font-medium mb-3">기술 스택</h3>
          <div className="flex flex-wrap gap-2">
            {contact.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-[#e1e4e6] text-[#52616B] px-3 py-1 rounded-full text-sm border border-[#bfc7d1]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-[#bfc7d1] pt-6">
        <h3 className="text-[#1E2022] font-medium mb-4">연락처 정보</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#52616B]">등록일:</span>
            <span className="text-[#1E2022]">
              {contact.createdAt
                ? new Date(contact.createdAt).toLocaleDateString('ko-KR')
                : '정보 없음'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#52616B]">최종 수정:</span>
            <span className="text-[#1E2022]">
              {contact.updatedAt
                ? new Date(contact.updatedAt).toLocaleDateString('ko-KR')
                : '정보 없음'
              }
            </span>
          </div>
          {contact.businessCardId && (
            <div className="flex justify-between">
              <span className="text-[#52616B]">명함 ID:</span>
              <span className="text-[#52616B] text-xs font-mono">
                {contact.businessCardId.substring(0, 8)}...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-error-warning-line w-6 h-6 text-red-500"></i>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#1E2022]">명함 삭제</h3>
                <p className="text-[#52616B] text-sm">정말로 이 명함을 삭제하시겠습니까?</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">
                <strong>{contact.name}</strong>의 명함이 영구적으로 삭제됩니다.
                이 작업은 되돌릴 수 없습니다.
              </p>
            </div>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <i className="ri-error-warning-line w-4 h-4 text-red-500"></i>
                  <p className="text-red-700 text-sm">{deleteError}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-[#1E2022] rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors"
              >
                {deleteLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <i className="ri-loader-4-line w-4 h-4 animate-spin"></i>
                    <span>삭제 중...</span>
                  </div>
                ) : (
                  '삭제하기'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
