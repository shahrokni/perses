// Copyright 2024 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { HTMLAttributes, ReactElement, useEffect, useState } from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useFieldArray, Control } from 'react-hook-form';
import LinkIcon from 'mdi-material-ui/Link';
import DeleteIcon from 'mdi-material-ui/Delete';
import ContentCopyIcon from 'mdi-material-ui/ContentCopy';
import EyeOutlineIcon from 'mdi-material-ui/EyeOutline';
import FileEditOutlineIcon from 'mdi-material-ui/FileEditOutline';
import { Link, PanelEditorValues } from '@perses-dev/core';
import { Dialog } from '@perses-dev/components';

export interface LinkEditorDialogInformation {
  index?: number;
  url?: string;
  name?: string;
  tooltip?: string;
  renderVariables?: boolean;
  openNewTab?: boolean;
}

export interface LinkEditorDialogProps {
  /**
   * Dialog title
   */
  headerTitle: string;

  /**
   * An option add button title which could be any desired string including add/edit/save/ etc.
   */
  addButtonTitle?: string;
  /**
   * The callback by which the consumer can access the entered values
   */
  onFinishEditing: (options: LinkEditorDialogInformation) => void;

  /**
   * Open closes the dialog
   */
  open: boolean;

  /**
   * The setter of the open prop. It used to close the dialog
   */
  setOpen: (isOpen: boolean) => void;

  /**
   * The readonly prop. Useful for view mode
   */
  readOnly?: boolean;

  /**
   * Optional user instruction. Especially useful for the dynamic links
   */
  userInstruction?: ReactElement;

  /**
   * An optional set of excluded options from link dialog. Different scenarios may have different options
   */
  excludeDialogOptions?: Array<keyof Omit<LinkEditorDialogInformation, 'url'>>;

  /**
   * An object of place holder per option. Useful when different scenarios have different placeholders for the same option.
   */
  dialogOptionsPlaceHolders?: Record<keyof Pick<LinkEditorDialogInformation, 'url' | 'name' | 'tooltip'>, string>;

  /**
   * Initial object which is used for editing
   */
  initialObject?: LinkEditorDialogInformation;
}

export const LinkEditorDialog = (props: LinkEditorDialogProps): ReactElement => {
  const {
    open,
    setOpen,
    userInstruction,
    onFinishEditing,
    headerTitle,
    addButtonTitle,
    initialObject,
    dialogOptionsPlaceHolders,
    excludeDialogOptions,
    readOnly,
  } = props;

  const [url, setUrl] = useState(initialObject?.url);
  const [name, setName] = useState(initialObject?.name);
  const [tooltip, setTooltip] = useState(initialObject?.tooltip);
  const [renderVariables, setRenderVariables] = useState(!!initialObject?.renderVariables);
  const [openNewTab, setOpenNewTab] = useState(!!initialObject?.openNewTab);
  const [fieldsError, setFieldErrors] = useState({ url: { hasError: false, helperText: '' } });
  /* IMPORTANT: This forces the dialog to re render when it closes and opens again  
     This cleans the internal states of the component
  */

  const validateFields = (): boolean => {
    if (!url) {
      setFieldErrors({ url: { hasError: true, helperText: 'URL can not be empty' } });
      return false;
    }
    return true;
  };

  const handleAddClick = (): void => {
    if (!validateFields()) return;
    onFinishEditing({
      url,
      name,
      tooltip,
      renderVariables,
      openNewTab,
      index: initialObject?.index,
    });
    setOpen(false);
  };

  return (
    <Dialog
      sx={{
        '& .MuiDialog-paper': {
          width: '80vw',
        },
      }}
      open={open}
    >
      <DialogTitle>{headerTitle}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <FormControl>
            <TextField
              disabled={readOnly}
              error={fieldsError?.url?.hasError}
              helperText={fieldsError?.url?.hasError ? fieldsError?.url.helperText : undefined}
              label="URL"
              sx={{ marginTop: '12px' }}
              multiline
              maxRows={5}
              onChange={(e) => {
                if (fieldsError?.url?.hasError) setFieldErrors({ url: { hasError: false, helperText: '' } });
                setUrl(e.target.value);
              }}
              type="url"
              placeholder={dialogOptionsPlaceHolders?.url}
              value={url}
            />
          </FormControl>
          {!excludeDialogOptions?.some((eo) => eo === 'name') && (
            <FormControl>
              <TextField
                disabled={readOnly}
                label="Name"
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder={dialogOptionsPlaceHolders?.name}
                type="text"
                value={name}
              />
            </FormControl>
          )}

          {!excludeDialogOptions?.some((eo) => eo === 'tooltip') && (
            <FormControl>
              <TextField
                disabled={readOnly}
                label="Tooltip"
                onChange={(e) => {
                  setTooltip(e.target.value);
                }}
                placeholder={dialogOptionsPlaceHolders?.tooltip || ''}
                type="text"
                value={tooltip}
              />
            </FormControl>
          )}

          {!excludeDialogOptions?.some((eo) => eo === 'renderVariables') && (
            <FormControl>
              <FormLabel>Render variables</FormLabel>
              <Switch
                readOnly={readOnly}
                onChange={(e) => {
                  setRenderVariables(e.target.checked);
                }}
                checked={renderVariables}
              />
            </FormControl>
          )}
          {!excludeDialogOptions?.some((eo) => eo === 'openNewTab') && (
            <FormControl>
              <FormLabel>Open in new tab</FormLabel>
              <Switch
                readOnly={readOnly}
                onChange={(e) => {
                  setOpenNewTab(e.target.checked);
                }}
                checked={openNewTab}
              />
            </FormControl>
          )}

          {userInstruction || null}
        </Stack>
      </DialogContent>

      <DialogActions>
        {!readOnly && (
          <Button variant="contained" onClick={handleAddClick}>
            {addButtonTitle || 'Save'}
          </Button>
        )}
        <Button
          onClick={() => {
            setOpen(false);
          }}
        >
          {readOnly ? 'Close' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface LinksEditorProps extends HTMLAttributes<HTMLDivElement> {
  control: Control<PanelEditorValues>;
}

export function LinksEditor({ control, ...props }: LinksEditorProps): ReactElement {
  const { fields, append, remove, update } = useFieldArray({
    control: control,
    name: 'panelDefinition.spec.links',
  });

  const [openLinkEditorDialog, setOpenLinkEditorDialog] = useState(false);
  const [editorDialogReadonly, setEditorDialogReadonly] = useState(false);
  const [linkEditorOptions, setLinkEditorInformation] = useState<LinkEditorDialogInformation>({});
  const [openDialogId, setOpenDialogId] = useState(0);

  let linkEditorDialogHeaderTitle = '';
  if (editorDialogReadonly) {
    linkEditorDialogHeaderTitle = 'View Link';
  } else {
    linkEditorDialogHeaderTitle = linkEditorOptions.url ? 'Edit Link' : 'Add Link';
  }

  useEffect(() => {
    setOpenDialogId((prev) => prev + 1);
  }, [openLinkEditorDialog]);

  const AddLinkButton = (): ReactElement => {
    return (
      <Button
        endIcon={<LinkIcon />}
        style={{ width: 'fit-content', height: 'fit-content' }}
        onClick={() => {
          setEditorDialogReadonly(false);
          setLinkEditorInformation({});
          setOpenLinkEditorDialog(true);
        }}
      >
        Add Link
      </Button>
    );
  };

  return (
    <Stack {...props} gap={3}>
      <LinkEditorDialog
        key={openDialogId}
        open={openLinkEditorDialog}
        setOpen={setOpenLinkEditorDialog}
        readOnly={editorDialogReadonly}
        headerTitle={linkEditorDialogHeaderTitle}
        addButtonTitle={linkEditorOptions.url ? 'Edit' : 'Add'}
        initialObject={linkEditorOptions}
        onFinishEditing={({ index, name, openNewTab: targetBlank, renderVariables, tooltip, url }) => {
          if (!url) throw Error('URL can not be empty');
          const link: Link = {
            name,
            targetBlank,
            renderVariables,
            tooltip,
            url,
          };
          if (index === undefined) append(link);
          else update(index, link);
        }}
      />
      {fields && fields.length > 0 ? (
        <>
          {fields.map((field, index) => (
            <>
              <LinkControl
                key={field.id}
                linkInformation={{ ...field, index }}
                onViewAction={() => {
                  setEditorDialogReadonly(true);
                  setLinkEditorInformation({ ...field });
                  setOpenLinkEditorDialog(true);
                }}
                onCopyAction={() => {
                  navigator.clipboard.writeText(field.url);
                }}
                onDeleteAction={() => {
                  remove(index);
                }}
                onEditAction={() => {
                  setEditorDialogReadonly(false);
                  setLinkEditorInformation({ ...field, index });
                  setOpenLinkEditorDialog(true);
                }}
              />
              <Divider />
            </>
          ))}
          <AddLinkButton />
        </>
      ) : (
        <Stack
          sx={{ width: '100%' }}
          direction="row"
          gap={1}
          alignItems="center"
          justifyContent="center"
          alignContent="center"
        >
          <Typography sx={{ marginBottom: '0px' }} textAlign="center" variant="subtitle1" mb={2}>
            No links defined!
          </Typography>
          <AddLinkButton />
        </Stack>
      )}
    </Stack>
  );
}

export interface LinkControlProp {
  linkInformation: LinkEditorDialogInformation;
  onDeleteAction?: () => void;
  onViewAction?: () => void;
  onCopyAction?: () => void;
  onEditAction?: () => void;
}

export const LinkControl = (props: LinkControlProp): ReactElement => {
  const {
    linkInformation: { url, name },
    onCopyAction,
    onDeleteAction,
    onViewAction,
    onEditAction,
  } = props;
  return (
    <Stack sx={{ paddingLeft: '8px', paddingRight: '8px' }} gap={2} flexGrow={1}>
      <Stack direction="row" gap={2}>
        <Typography flexGrow={1} variant="subtitle1" noWrap>
          {name || url}
        </Typography>
        {onCopyAction && (
          <IconButton onClick={onCopyAction}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        )}

        {onViewAction && (
          <IconButton onClick={onViewAction}>
            <EyeOutlineIcon fontSize="small" />
          </IconButton>
        )}

        {onDeleteAction && (
          <IconButton onClick={onDeleteAction}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}

        {onEditAction && (
          <IconButton onClick={onEditAction}>
            <FileEditOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};
